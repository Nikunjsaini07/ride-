import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
