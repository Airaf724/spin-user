
import { Request , Response } from "express"
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { TryCaych } from "../utils/TryCatch.js";
import { oauth2Client } from "../utils/goggleConfig.js";
import axios from "axios";
import bcrypt from "bcrypt";
export interface GoogleRequest {
 email: string;
  name: string;
  picture: string;
}

const generateToken = (user : any) => {
    return jwt.sign({user} , process.env.JWT_SECRET as string, {
        expiresIn: "5d"
    });
};


export const googleLogin = async (req : Request , res : Response) => {
    try {
        const {code} = req.body;
        if (!code) {
            res.status(400).json({ message: "Authorization Code is required" });
            return ;
        }

        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);

        const userRes = await axios.get<GoogleRequest>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);

        const { email, name , picture } = userRes.data;

        let user = await User.findOne({ email});
        if (!user) {
            user = await User.create({ username:name , email, picture });
        }

        const token = generateToken(user);

        res.status(200).json({message:"Login succssfull" ,  token ,user });


    } catch (error) {
        console.log("Error in login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// register with email password
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

    // Exclude password before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.log("Error in register:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

    const { password: _, ...userWithoutPassword } = user.toObject();


    res.status(200).json({ message: "Login successful", token, user:userWithoutPassword });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMe = TryCaych(async(req: AuthenticatedRequest, res)=>{
    const user = req.user;
    res.json(user);
})



 // export const getMe = async (req: AuthenticatedRequest, res: Response) => {
//     try {
//         if (!req.user) {
//             return res.status(401).json({ message: "Unauthorized" });
//         }   
//         const user = await User.findById(req.user._id).select("-password");
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }       
//         res.status(200).json(user);
//     } catch (error) {   
//         console.error("Error fetching user:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }   
// };