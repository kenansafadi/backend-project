
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require('joi');

// Define Address Schema
const addressSchema = new mongoose.Schema({
    state: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    street: {
        type: String,
        required: true,
        trim: true,
    },
    houseNumber: {
        type: Number,
        required: true,
    },
    zip: {
        type: Number,
        required: true,
    },
});

// Define Image Schema
const imageSchema = new mongoose.Schema({
    url: {
        default: null,
        type: String,
        match: [/^https?:\/\/.+/, "Invalid URL format"],
    },
    alt: {
        default: null,
        type: String,
        trim: true,
    },
});

// Models for Address and Image
const Address = mongoose.model("Address", addressSchema, "addresses");
const Image = mongoose.model("Image", imageSchema, "images");

// Define Card Schema
const cardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subtitle: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, "Invalid phone number format"],
    },
    email: {
        type: String,
        required: true,
        match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    web: {
        type: String,
        required: true,
        match: [/^https?:\/\/.+/, "Invalid URL format"],
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image", // Reference to the Image model
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address", // Reference to the Address model
    },
    bizNumber: {
        type: Number,
        min: 100,
        max: 9_999_999_999,
        unique: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

// Create Model for Card
const Card = mongoose.model("Card", cardSchema, "cards");

// Generate Unique Business Number
async function generateBizNumber(maxRetries = 10) {
    let retries = 0;
    while (retries < maxRetries) {
        const random = _.random(100, 9_999_999_999);
        const card = await Card.findOne({ bizNumber: random });
        if (!card) {
            return random;
        }
        retries++;
    }
    throw new Error('Failed to generate a unique business number after multiple attempts');
}

const validateCard = (card, isUpdate = false) => {
    const schema = Joi.object({
        title: Joi.string().min(2).max(50).required(),
        subtitle: Joi.string().min(2).max(50).required(),
        description: Joi.string().min(5).max(1024).required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        email: Joi.string().email().required(),
        web: Joi.string().uri().required(),
        image: Joi.object({
            url: Joi.string().uri().allow("").optional(), // Allow empty string or valid URI
            alt: Joi.string().allow("").optional(),
        }).optional(),
        address: Joi.object({
            state: Joi.string().optional(),
            country: Joi.string().min(2).max(50).required(),
            city: Joi.string().min(2).max(50).required(),
            street: Joi.string().min(2).max(50).required(),
            houseNumber: Joi.number().required(),
            zip: Joi.number().required(),
        }).required(),
        likes: Joi.array().items(Joi.string().hex().length(24)),
    });

    return schema.validate(card);
}


module.exports = {
    Card,
    Address,   // Export Address model
    Image,     // Export Image model
    generateBizNumber,
    validateCard,
};
