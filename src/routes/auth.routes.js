import { Router } from "express";
import passport from "passport";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";

const router = Router();

// ✅ This is now reachable at /auth/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err || !user) {
        console.error("Google auth failed:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000 // 15 minutes for access token
      };

      const refreshOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

      // ✅ Redirect to /auth/success — gives browser time to store cookie
      //    before profile API is called
      res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
        .redirect(`${frontendUrl}/auth/success`);

    })(req, res, next);
  }
);

export default router;