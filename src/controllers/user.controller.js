import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/apiResoponse.js';
import {ApiError} from '../utils/apiError.js';
import {prisma} from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {generateAccessToken, generateRefreshToken} from '../utils/tokens.js';
import {verifyJWT} from '../middlewares/authRoutes.js';
import validator from "validator";

import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const registerUser = asyncHandler(async (req, res, next) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(
            new ApiError(
                400,
                "Name, email and password are required"
            )
        );
    }

    if (!validator.isEmail(email)) {
        return next(
            new ApiError(
                400,
                "Invalid email format"
            )
        );
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

   if (existingUser) {

    if (!existingUser.isVerified) {

        const verificationToken =
            crypto.randomBytes(32).toString("hex");

        const hashedToken =
            crypto.createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        await prisma.user.update({
            where: {
                email
            },
            data: {
                verificationToken: hashedToken,
                verificationExpiry: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                )
            }
        });

        const verifyUrl =
            `http://localhost:3000/api/v1/users/verify-email/${verificationToken}`;

        await sendEmail(
            existingUser.email,
            "Verify Your Account",
            `
            <h2>Email Verification</h2>

            <p>
                Your account exists but is not verified.
            </p>

            <p>
                Click below to verify:
            </p>

            <a href="${verifyUrl}">
                Verify Email
            </a>

            <br><br>

            <p>
                If the button doesn't work:
            </p>

            <p>${verifyUrl}</p>
            `
        );

        return res.status(200).json(
            new ApiResponse(
                true,
                "Verification email sent again",
                null
            )
        );
    }

    return next(
        new ApiError(
            400,
            "User already exists"
        )
    );
}

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const verificationToken =
        crypto.randomBytes(32).toString("hex");

    const hashedToken =
        crypto.createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,

            verificationToken: hashedToken,

            verificationExpiry: new Date(
                Date.now() +
                24 * 60 * 60 * 1000
            )
        }
    });

    const verifyUrl =
        `http://localhost:3000/api/v1/users/verify-email/${verificationToken}`;

    await sendEmail(
    user.email,
    "Verify Your Account",
    `
    <h2>Email Verification</h2>

    <p>Click the button below to verify your account:</p>

    <a href="${verifyUrl}">
        Verify Email
    </a>

    <br><br>

    <p>If the button doesn't work, copy this URL:</p>

    <p>${verifyUrl}</p>
    `
);

    return res.status(201).json(
        new ApiResponse(
            true,
            "User registered successfully. Please verify your email.",
            null
        )
    );
});
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(
            new ApiError(400, "Email and password are required")
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        return next(
            new ApiError(401, "Invalid credentials")
        );
    }

    if(!user.isVerified){
    return next(
        new ApiError(
            403,
            "Please verify your email first"
        )
    );
}

if (!user.password) {
    return next(
        new ApiError(
            400,
            "Please login using Google"
        )
    );
}

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        return next(
            new ApiError(401, "Invalid password")
        );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const options = {
    httpOnly: true,
    secure: true, 
    sameSite: "none"
};

    return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200).json(
        new ApiResponse(
            true,
            "Login successful",
            userWithoutPassword,
            

        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                true,
                "Logged out successfully",
                null
            )
        );
});

const UserProfile = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    return res.status(200).json(
        new ApiResponse(
            true,
            user,
            "Profile fetched"
        )
    );
});

const verifyEmail =
asyncHandler(async (req,res,next)=>{

    const hashedToken =
        crypto.createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user =
        await prisma.user.findFirst({
            where:{
                verificationToken:
                    hashedToken
            }
        });

    if(!user){
        return next(
            new ApiError(
                400,
                "Invalid token"
            )
        );
    }

    if(
        user.verificationExpiry <
        new Date()
    ){
        return next(
            new ApiError(
                400,
                "Token expired"
            )
        );
    }

    await prisma.user.update({
        where:{
            id:user.id
        },
        data:{
            isVerified:true,
            verificationToken:null,
            verificationExpiry:null
        }
    });

    return res.status(200).json(
        new ApiResponse(
            true,
            "Email verified successfully",
            null
        )
    );
});

const forgotPassword = asyncHandler(async (req, res, next) => {

    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        return next(
            new ApiError(
                404,
                "User not found"
            )
        );
    }

    const resetToken =
        crypto.randomBytes(32).toString("hex");

    const hashedToken =
        crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: new Date(
                Date.now() + 15 * 60 * 1000
            )
        }
    });

    const resetUrl =
        `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail(
        user.email,
        "Reset Password",
        `
        <h2>Password Reset</h2>

        <p>
            Click below to reset password:
        </p>

        <a href="${resetUrl}">
            Reset Password
        </a>

        <br><br>

        <p>${resetUrl}</p>
        `
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password reset email sent"
        )
    );
});

const resetPassword = asyncHandler(async (req, res, next) => {

    const { token } = req.params;

    const { password } = req.body;

    const hashedToken =
        crypto.createHash("sha256")
        .update(token)
        .digest("hex");

    const user =
        await prisma.user.findFirst({
            where: {
                resetPasswordToken:
                    hashedToken
            }
        });

    if (!user) {
        return next(
            new ApiError(
                400,
                "Invalid token"
            )
        );
    }

    if (
        user.resetPasswordExpiry <
        new Date()
    ) {
        return next(
            new ApiError(
                400,
                "Token expired"
            )
        );
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password reset successful"
        )
    );
});

export {registerUser,loginUser,UserProfile,logoutUser, verifyEmail,forgotPassword,resetPassword}