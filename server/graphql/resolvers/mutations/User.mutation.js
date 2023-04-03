import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../../../constants/env-keys.js";
import User from "../../../models/User.js";
import { userValidationSchema } from "../../../validator/user.validator.js";

const UserMutation = {
    async register(_, { username, email, password }) {
        const { error } = userValidationSchema.Mutation.register.validate({ username, email, password });
        if (error) {
            throw new Error(`Input validation error: ${error.message}`);
        }
        const user = await User.findOne({ username });

        if (user) {
            throw new Error("Username is taken");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        const res = await newUser.save();

        const token = jwt.sign({ id: res.id, username: res.username }, JWT_SECRET, { expiresIn: "3h" });

        return {
            ...res._doc,
            id: res._id,
            token,
        };
    },

    async login(_, { username, password }) {
        const { error } = userValidationSchema.Mutation.login.validate({ username, password });
        if (error) {
            throw new Error(`Input validation error: ${error.message}`);
        }
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error("User not found");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "3h" });

        return {
            ...user._doc,
            id: user._id,
            token,
        };
    },

};

export default UserMutation;


