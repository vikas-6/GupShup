import { Request, Response } from "express";
import User from "../modals/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/tokens";


export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, name, avatar } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if(user) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    // Create new user
    user = new User({
      email,
      password,
      name,
      avatar: avatar || ""
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.json({
        success: true,
        token,
    });

  } catch (error) {
    console.log("Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if(!user) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }
    
    // Generate JWT token
    const token = generateToken(user);

    res.json({
        success: true,
        token,
    });

  } catch (error) {
    console.log("Error logging in user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};