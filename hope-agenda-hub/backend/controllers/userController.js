import nodemailer from "nodemailer";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getVerificationHtml(code) {
  return `
    <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 15px; background: #fff0f5;">
      <h2 style="text-align: center; color: #46022f;">Welcome to personal-Agenda</h2>
      <p style="font-size: 16px; color: #1d1616;">Use the verification code below to complete your signup:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 36px; font-weight: bold; color: #3d033a; letter-spacing: 5px;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #888; text-align: center;">This code expires in 15 minutes.</p>
    </div>
  `;
}

async function sendWithSmtp(toEmail, subject, html) {
  const smtpUser = process.env.EMAIL_USER?.trim();
  const smtpPass = process.env.EMAIL_PASS?.replace(/\s+/g, "");
  const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.office365.com";
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = process.env.SMTP_SECURE === "true";

  if (!smtpUser || !smtpPass) {
    throw new Error("Email config missing: set EMAIL_USER and EMAIL_PASS");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `Agenda <${smtpUser}>`,
    to: toEmail,
    subject,
    html,
  });
}

function hasSmtpConfig() {
  return Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim());
}

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

async function sendWithResend(toEmail, subject, html) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";

  if (!apiKey) {
    throw new Error("Resend config missing: set RESEND_API_KEY");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorText}`);
  }
}

// Send email
async function sendVerificationEmail(toEmail, code) {
  const subject = "Your Verification Code";
  const html = getVerificationHtml(code);
  const provider = (process.env.EMAIL_PROVIDER || "smtp").toLowerCase();
  const attempts =
    provider === "resend"
      ? [
          { name: "resend", enabled: hasResendConfig(), send: () => sendWithResend(toEmail, subject, html) },
          { name: "smtp", enabled: hasSmtpConfig(), send: () => sendWithSmtp(toEmail, subject, html) },
        ]
      : [
          { name: "smtp", enabled: hasSmtpConfig(), send: () => sendWithSmtp(toEmail, subject, html) },
          { name: "resend", enabled: hasResendConfig(), send: () => sendWithResend(toEmail, subject, html) },
        ];

  const configuredAttempts = attempts.filter((attempt) => attempt.enabled);

  if (configuredAttempts.length === 0) {
    throw new Error(
      "No email provider is configured. Set either RESEND_API_KEY or EMAIL_USER and EMAIL_PASS."
    );
  }

  let lastError;

  for (const attempt of configuredAttempts) {
    try {
      await attempt.send();
      return;
    } catch (error) {
      lastError = error;
      console.error(`Email send failed with ${attempt.name}:`, error.message);
    }
  }

  throw lastError;
}

// JWT token generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified)
      return res.status(400).json({ message: "User already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();
    const verificationCodeExpires = Date.now() + 15 * 60 * 1000;

    let user;
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.isVerified = false;
      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpires = verificationCodeExpires;
      user = await existingUser.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
        verificationCodeExpires,
      });
    }

    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailErr) {
      if (!existingUser && user?._id) {
        await User.findByIdAndDelete(user._id);
      }
      console.error("Verification email error:", emailErr.message);
      const smtpReason =
        emailErr?.response || emailErr?.message || "Unknown SMTP error";
      return res.status(500).json({
        message:
          "Could not send verification email. Check your provider settings in backend/.env.",
        error: smtpReason,
      });
    }

    res.status(201).json({
      success: true,
      message: "Signup successful! Check your email for verification code.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const trimmedCode = code?.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    if (!user.verificationCode || Date.now() > user.verificationCodeExpires)
      return res.status(400).json({ message: "Verification code expired" });

    if (user.verificationCode !== trimmedCode)
      return res.status(400).json({ message: "Invalid code" });

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified) return res.status(401).json({ message: "Please verify your email first" });

    const token = generateToken(user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const code = generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, code);

    res.json({ success: true, message: "Password reset code sent to email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.resetPasswordCode !== code) return res.status(400).json({ message: "Invalid reset code" });
    if (Date.now() > user.resetPasswordExpires) return res.status(400).json({ message: "Reset code expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
