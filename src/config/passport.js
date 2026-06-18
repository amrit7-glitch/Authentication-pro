import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${(process.env.BACKEND_URL || "https://authentication-pro-jlye.onrender.com").replace(/\/$/, "")}/auth/google/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Auth Profile Received:", profile.emails[0].value);
        const email = profile.emails[0].value;

        let user = await prisma.user.findUnique({
          where: { email },
        });

       if (!user) {
          console.log("Creating new Google user:", email);
          user = await prisma.user.create({
            data:{
                name: profile.displayName,
                email: profile.emails[0].value,
                provider:"google",
                isVerified:true
            }
          });
        }

        console.log("Google Auth Success for:", email);
        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;