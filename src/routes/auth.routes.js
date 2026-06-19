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
    session: false,
    state: false
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport Auth Error:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }
      if (!user) {
        console.error("Passport Auth Failed - No User:", info);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=unauthorized`);
      }
      
      // If authentication succeeded, proceed to issue tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

     

      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      };

      const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
      const redirectUrl = `${frontendUrl}/profile`;
      
      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect(redirectUrl);
    })(req, res, next);
  }
);

export default router;