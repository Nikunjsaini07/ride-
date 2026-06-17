import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail, resetPasswordEmail, loginOtpEmail } from "../config/mailer.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  hasBike: user.hasBike,
  ratingAvg: user.ratingAvg,
  ratingCount: user.ratingCount,
});

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, hasBike } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      hasBike: !!hasBike,
    });
    res.status(201).json({ user: sanitize(user), token: signToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`[Verification] Login OTP for ${user.email} is: ${otp}`);

    // Try sending email but don't fail login request if email credentials are not set
    try {
      await sendEmail({
        to: user.email,
        subject: "Your RideShare Verification Code",
        html: loginOtpEmail({ name: user.name, otp }),
      });
    } catch (mailErr) {
      console.warn(`[Verification] Could not send login OTP email to ${user.email}: ${mailErr.message}`);
    }

    res.json({ otpRequired: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({ message: "No verification requested or code expired. Please log in again." });
    }
    if (new Date() > user.loginOtpExpires) {
      user.loginOtp = null;
      user.loginOtpExpires = null;
      await user.save();
      return res.status(400).json({ message: "Verification code has expired. Please log in again." });
    }
    if (user.loginOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Clear OTP fields
    user.loginOtp = null;
    user.loginOtpExpires = null;
    await user.save();

    res.json({ user: sanitize(user), token: signToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};

export const updateMe = async (req, res) => {
  try {
    const { name, phone, hasBike } = req.body;
    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (hasBike !== undefined) user.hasBike = !!hasBike;
    await user.save();
    res.json({ user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Send a password-reset link to the user's email (via Brevo).
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond success to avoid leaking which emails are registered.
    const genericMsg =
      "If an account exists for that email, a reset link has been sent.";
    if (!user) return res.json({ message: genericMsg });

    // Create a random token; store only its hash.
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const base = (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");
    const resetUrl = `${base}/reset-password?token=${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your SUG RideShare password",
        html: resetPasswordEmail({ name: user.name, resetUrl }),
      });
    } catch (mailErr) {
      // Roll back the token if the email failed to send.
      user.resetTokenHash = null;
      user.resetTokenExpires = null;
      await user.save();
      return res
        .status(502)
        .json({ message: "Could not send the email. Please try again later." });
    }

    res.json({ message: genericMsg });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reset the password using a valid, unexpired token.
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired" });
    }

    user.password = password; // hashed by the pre-save hook
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ user: sanitize(user), token: signToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
