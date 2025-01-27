const Joi = require("joi");
const mongoose = require("mongoose");

// הגדרת סכמה למשתמש
const userSchema = new mongoose.Schema({
    name: {
        first: { type: String, required: true, minlength: 2, maxlength: 255 },
        middle: { type: String, maxlength: 255, default: "" },
        last: { type: String, required: true, minlength: 2, maxlength: 255 },
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, "Invalid phone number format"],
    },
    email: {
        type: String,
        required: true,
        default: false,
        minlength: 6,
        maxlength: 255,
        unique: true,
    },
    password: {
        type: String,
        default: false,
        required: true,
        minlength: 8,
    },
    image: {
        url: { type: String, match: [/^https?:\/\/.+/, "Invalid URL format"], required: false, default: "" },
        alt: { type: String, required: false, trim: true },
    },
    address: {
        state: { type: String, default: "" },
        country: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        houseNumber: { type: Number, required: true },
        zip: { type: Number, required: true },
    },
    isAdmin: { type: Boolean, default: false },
    isBusiness: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// יצירת מודל של המשתמש

const User = mongoose.model("User", userSchema, "users");

// פונקציה לוולידציה של נתוני משתמש באמצעות Joi

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().min(2).max(255).required(),
            middle: Joi.string().max(255).allow(""),
            last: Joi.string().min(2).max(255).required(),
        }).required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        email: Joi.string().email().min(6).max(255).required(),
        password: Joi.string().min(8).required(),
        image: Joi.object({
            url: Joi.string().uri().allow("").default(""),
            alt: Joi.string().max(255).allow("").default(""),
        }).optional(),
        address: Joi.object({
            state: Joi.string().max(255).optional().allow(""),
            country: Joi.string().required(),
            city: Joi.string().required(),
            street: Joi.string().required(),
            houseNumber: Joi.number().required(),
            zip: Joi.number().optional(),
        }).required(),
        isBusiness: Joi.boolean().required(),
    });

    return schema.validate(user);
}


module.exports = { User, validateUser };

