const jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = (req, res, next) => {
    // Retrieve the token from headers (supports 'x-auth-token' or 'Authorization: Bearer <token>')
    const token = req.header("x-auth-token") || req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).send("Access denied. No token provided.");
        return;
    }

    try {
        // Verify the token
        const payload = jwt.verify(token, config.jwtKey); // Using config.jwtKey

        // Attach the payload to the request object for use in routes
        req.user = payload;

        // Pass control to the next middleware or route handler
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === "TokenExpiredError") {
            res.status(401).send("Token expired. Please log in again.");
        } else {
            console.error("Token verification failed:", error.message); // Log the error for debugging
            res.status(400).send("Invalid token.");
        }
    }
};
