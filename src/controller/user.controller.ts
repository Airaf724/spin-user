import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { TryCaych } from "../utils/TryCatch.js";
// import { oauth2Client } from "../utils/goggleConfig.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

export interface GoogleRequest {
  email: string;
  name: string;
  picture: string;
}

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);



// Utility to sanitize user object
const sanitizeUser = (user: any) => {
  if (!user) return null;

  const { password, points, diamonds, availableSpins, contestPoints, lastAdWatched, __v, ...safeUser } =
    user.toObject ? user.toObject() : user;

  return safeUser;
};

const generateToken = (user: any) => {
  return jwt.sign({ user: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "5d",
  });
};

// ================= Google Login =================
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Authorization Code is required" });
    }

    // 🔹 Exchange the one-time code
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: "postmessage",
    });

    console.log("🔑 Google Token Response:", JSON.stringify(tokens, null, 2));

    // 🔹 Always set credentials after getting tokens
    oauth2Client.setCredentials(tokens);

    // 🔹 Verify ID token if present
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ username: name, email, picture });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error("❌ Error in googleLogin:", error.response?.data || error.message || error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




// ================= Register =================
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log("Error in register:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ================= Login =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ================= Get Me =================
export const getMe = TryCaych(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json(req.user);
});

