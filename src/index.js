import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import express from 'express';
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import userRouter from "./routes/user.router.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  // ✅ Put your actual Render frontend URL here
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

// ✅ Single consistent mount — no duplicates
app.use("/api/v1", userRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});