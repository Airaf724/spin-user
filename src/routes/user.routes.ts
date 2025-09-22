import express from "express";
import { googleLogin, register, login, getMe } from "../controller/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/auth/google", googleLogin);
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", isAuth, getMe);

export default router;
