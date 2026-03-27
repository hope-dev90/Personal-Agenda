

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Verify Your Email - Personal Agenda",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", to);
  } catch (error) {
    console.error("Email sending error:", error.message);
    throw new Error("Email sending failed");
  }
};

module.exports = { sendVerificationEmail };