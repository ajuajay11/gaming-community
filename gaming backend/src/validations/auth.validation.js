const Joi = require("joi");

const passwordSchema = Joi.string().min(8).required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
const registerSchema = Joi.object({
    email: Joi.string().email().pattern(/^\S+@\S+\.\S+$/),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    password: passwordSchema,
    // Controller only accepts these two — keep Joi in lock-step so we don't
    // lie to the client about which roles are actually permitted.
    role: Joi.string().valid("gamer", "admin").default("gamer"),
}).xor("email", "phone").required();

const generateOtpSchema = Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    purpose: Joi.string().valid("forgot-password", "login", "register").required(),
}).xor("email", "phone").required();

const verifyOtpSchema = Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    code: Joi.string().required(),
    purpose: Joi.string().valid("register", "forgot-password").default("register"),
}).xor("email", "phone").required();

const loginSchema = Joi.object({
    email: Joi.string().email().pattern(/^\S+@\S+\.\S+$/),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    password: passwordSchema,
}).xor("email", "phone").required();

const loginWithOtpSchema = Joi.object({
    email: Joi.string().email().pattern(/^\S+@\S+\.\S+$/),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    code: Joi.string().required(),
    purpose: Joi.string().valid("forgot-password", "login").required(),
}).xor("email", "phone").required();

const resetPasswordSchema = Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    newPassword: passwordSchema,
}).xor("email", "phone").required();

/** Optional password when the account has a password (email/phone login). */
const deleteAccountSchema = Joi.object({
    password: Joi.string().allow("").optional(),
});

module.exports = {
    registerSchema,
    generateOtpSchema,
    verifyOtpSchema,
    loginSchema,
    /** Alias used by auth routes for email/phone + password login */
    loginEmailOrPhoneSchema: loginSchema,
    loginWithOtpSchema,
    resetPasswordSchema,
    deleteAccountSchema,
};