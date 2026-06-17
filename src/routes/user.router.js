import {Router} from 'express';

import {registerUser,loginUser,UserProfile,logoutUser,verifyEmail,forgotPassword,resetPassword} from "../controllers/user.controller.js";
import {verifyJWT} from '../middlewares/authRoutes.js';
const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT,logoutUser);
userRouter.route("/profile").get(verifyJWT, UserProfile);
userRouter.route("/verify-email/:token").get(verifyEmail);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password/:token").post(resetPassword);
export default userRouter;