import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = (req, res, next) => {
    try {
        console.log("Cookies:", req.cookies);

        const token = req.cookies?.accessToken;

        console.log("Token:", token);

        if (!token) {
            return next(
                new ApiError(401, "Unauthorized")
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();
    } catch (error) {
        console.error("JWT VERIFY ERROR:", error);

        return next(
            new ApiError(401, "Invalid token")
        );
    }
};