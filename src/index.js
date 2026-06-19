import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import express from 'express';
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import cors from "cors";

import { prisma } from "./lib/prisma.js";


//import authRoutes from "./middlewares/auth.middleware.js";
import userRouter from "./routes/user.router.js";
import authRouter from "./routes/auth.routes.js";
const app = express();

app.set("trust proxy", 1); // Trust Render's proxy

app.use(cors({
  origin: ["https://authentication-frontend-dun.vercel.app", process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(passport.initialize());

console.log("CORS Origin configured as:", process.env.FRONTEND_URL);




// Health check
app.get("/", (req, res) => {
  res.json({
    message: "API running"
  });
});

// Routes
app.use("/api/v1/auth", authRouter);
// app.use("/auth", authRouter); // Fallback for root auth

app.use("/api/v1", userRouter);
// app.use("/", userRouter); // Fallback for root routes

// 404 Handler
app.use((req, res, next) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found on Backend`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});


// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// console.log(PORT);
// console.log("After listen");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("Server object created");
console.log("Listening:", server.listening);




