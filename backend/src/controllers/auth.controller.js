import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { registerSchema, loginSchema } from "../validation/auth.validation.js";
import { generateJwtToken } from "../utils/genJwtToken.js";
import { jwt } from "zod";

// Signup controller
export const signup = async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        errors: parseResult.error.format(),
      });
    }

    const { username, email, password } = parseResult.data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already is in use" });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: `User: ${newUser.username} registered successfully` });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        errors: parseResult.error.format(),
      });
    }

    const { email, password } = parseResult.data;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateJwtToken({ userId: existingUser._id });

    const options = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    // Send token in response
    res
      .cookie("token", token, options)
      .json({ message: "Login successful", jwtToken: token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    res.clearCookie("token").json({ message: "Logout successful" });
  } catch (error) {}
};
