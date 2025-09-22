import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../model/user.model.js';
 

export interface AuthenticatedRequest extends Request {
    user? : IUser|null
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) : Promise<void>=> {

    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Login in - Unauthorized' });
            return ;
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string)as JwtPayload;
        
        if(!decodedToken || !decodedToken.user){
            res.status(401).json({ message: 'Invalid token'});
            return;
        }

        req.user = decodedToken.user;
        next();
    }catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: " Login in - Unauthorized" });
    }
}