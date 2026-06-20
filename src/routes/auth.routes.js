import { Router } from "express";
import passport from "passport";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";

const router = Router();

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

      const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

      // ✅ Send tokens in URL — cookies don't work cross-domain
      return res.redirect(
        `${frontendUrl}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );

    })(req, res, next);
  }
);

export default router;