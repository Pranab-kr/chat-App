import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { registerSchema, loginSchema } from "../validation/auth.validation.js";
import { generateJwtToken } from "../utils/genJwtToken.js";
import cloudinary from "../utils/cloudinary.js";

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

    const returnedUser = await User.findById(newUser._id).select("-password");

    res.status(201).json({
      message: `User: ${newUser.username} registered successfully`,
      user: returnedUser,
    });
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

    const returnedUser = await User.findById(existingUser._id).select(
      "-password"
    );
    // Send token in response
    res.cookie("token", token, options).json({
      message: "Login successful",
      user: returnedUser,
      jwtToken: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update Profile Picture controller
export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    let profilePicUrl = user.profilePic;

    //uploads new image
    if (profilePic) {
      const uploadResult = await cloudinary.uploader.upload(profilePic, {
        folder: "chatApp/profile_pics",
        width: 150,
        height: 150,
        crop: "fill",
      });

      profilePicUrl = uploadResult.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//get current user controller
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
