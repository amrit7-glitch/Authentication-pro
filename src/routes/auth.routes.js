import { Router } from "express";
import passport from "passport";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokens.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  async (req, res) => {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const options = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    };

    res
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .redirect("http://localhost:5173/profile");
  }
);

export default router;