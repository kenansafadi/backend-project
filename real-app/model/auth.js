// model/auth.js

const mongoose = require('mongoose');
const Joi = require('joi');

// Define the schema for Auth
const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create the Auth model based on the schema
const Auth = mongoose.model('Auth', authSchema);

// Validate the Auth input
function validateAuth(auth) {
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).email().required(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(auth);
}

// Export the Auth model and validation function
module.exports = {
    Auth,
    validateAuth
};
