import nodemailer from "nodemailer";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      "Email service is not configured. Set EMAIL_USER and EMAIL_PASS or SMTP credentials."
    );
  }

  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

async function sendVerificationEmail(toEmail, code, subject = "Your Verification Code") {
  const transporter = createTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  const normalizedRecipient = normalizeEmail(toEmail);

  const htmlContent = `
    <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 15px; background: #fff0f5;">
      <h2 style="text-align: center; color: #46022f;">Welcome to Personal Agenda</h2>
      <p style="font-size: 16px; color: #1d1616;">Use the verification code below to continue:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 36px; font-weight: bold; color: #3d033a; letter-spacing: 5px;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #888; text-align: center;">This code expires in 15 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Personal Agenda" <${fromEmail}>`,
    to: normalizedRecipient,
    subject,
    html: htmlContent,
  });
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();
    const verificationCodeExpires = Date.now() + 15 * 60 * 1000;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    try {
      await sendVerificationEmail(normalizedEmail, verificationCode);
      console.log("Verification email sent to:", normalizedEmail);
    } catch (emailErr) {
      await User.findByIdAndDelete(user._id);
      console.error("Verification email failed:", emailErr);
      return res.status(502).json({
        message:
          "We couldn't send the verification email. Check your mail credentials and try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Signup successful! Check your email for verification code.",
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const trimmedCode = code?.trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    if (!user.verificationCode || Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    if (user.verificationCode !== trimmedCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Verify email error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email first" });
    }

    const token = generateToken(user._id);
    return res.json({ _id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(400).json({ message: "User not found" });

    const code = generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationEmail(normalizedEmail, code, "Your Password Reset Code");
      console.log("Reset code sent to:", normalizedEmail);
    } catch (emailErr) {
      console.error("Reset email failed:", emailErr);
      return res.status(502).json({
        message: "We couldn't send the reset email. Check your mail credentials and try again.",
      });
    }

    return res.json({ success: true, message: "Password reset code sent to email." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: "Reset code expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
