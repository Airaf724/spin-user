import { RequestHandler ,Request , Response ,   NextFunction } from "express";

export const TryCaych = (handler : RequestHandler):RequestHandler => {
    return async (req : Request, res : Response, next : NextFunction) => {
        try {
            await handler(req , res, next);
        }catch (error) {
            console.error("Error in TryCatch:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}       