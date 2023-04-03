
import Joi from "joi";

const userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

const registerSchema = userSchema;

export const userValidationSchema = {
    Mutation: {
        login: loginSchema,
        register: registerSchema,
    },
};