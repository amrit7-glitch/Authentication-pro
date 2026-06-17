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


// Middleware
app.use(express.json({limit:'16kb'}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))




// Routes
//app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);


// Health check
app.get("/", (req, res) => {
  res.json({
    message: "API running"
  });
});

//console.log(process.env.DATABASE_URL);
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




