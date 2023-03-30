
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-express";
import { JWT_SECRET } from "../constants/env-keys.js";

const checkAuth = (context) => {
    const authHeader = context.req.headers.authorization;

    if (!authHeader) {
        throw new Error("Authorization header must be provided");
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
        throw new Error("Authentication token must be 'Bearer [token]'");
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        return user;
    } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
    }
};

export default checkAuth;
