const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        first: { type: String, required: true, minlength: 2, maxlength: 255 },
        middle: { type: String, maxlength: 255, default: "" },  // Optional and defaults to an empty string
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
        default: false,  // Password stored as a string
        required: true,
        minlength: 8,  // Enforce minimum length for password
    },
    image: {
        url: { type: String, match: [/^https?:\/\/.+/, "Invalid URL format"], required: false, default: "" }, // Optional and defaults to an empty string
        alt: { type: String, required: false, trim: true }, // Optional and defaults to an empty string
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

const User = mongoose.model("User", userSchema, "users");

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().min(2).max(255).required(),
            middle: Joi.string().max(255).allow(""), // Optional
            last: Joi.string().min(2).max(255).required(),
        }).required(),  // Make sure `name` is required
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        email: Joi.string().email().min(6).max(255).required(),
        password: Joi.string().min(8).required(),
        image: Joi.object({
            url: Joi.string().uri().allow("").default(""),  // Allow empty string for url
            alt: Joi.string().max(255).allow("").default(""), // Allow empty string for alt
        }).optional(), // image is optional
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

