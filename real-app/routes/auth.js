const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Auth } = require("../model/auth"); // Reference to Auth model
const { User, validateUser } = require("../model/users");
const config = require("../config/config");

const router = express.Router();



router.post("/register", async (req, res) => {
    // Validate user data
    console.log(req.body);  // Log the request body

    const { error } = validateUser(req.body); // Full user validation
    if (error) return res.status(400).send(error.details[0].message);

    // Check if the user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    // Hash the password only once
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // Prepare user data
    const userData = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: hashedPassword,
        address: req.body.address,
        isBusiness: req.body.isBusiness
    };

    // Only assign the image if it's provided and is not an empty object
    if (req.body.image && req.body.image.url !== '' && req.body.image.alt !== '') {
        userData.image = req.body.image;
    }

    // Create and save the User
    user = new User(userData);
    await user.save();

    // Create and save the Auth document (no need to hash the password again)
    const auth = new Auth({
        email: req.body.email,
        password: hashedPassword  // Use the already hashed password
    });
    await auth.save();

    res.status(201).send("User registered successfully");
});

router.post("/login", async (req, res) => {
    console.log("Login route hit"); // Log to confirm the route is hit

    const { email, password } = req.body;
    console.log("Request body:", req.body); // Log the request body

    // Check if the email exists
    const auth = await Auth.findOne({ email });
    if (!auth) {
        console.log("User not found"); // Log if the user is not found
        return res.status(400).send("Invalid email or password.");
    }

    // Log the stored password (hashed) and entered password
    console.log("Stored password: ", auth.password); // Log the hashed password from the database
    console.log("Entered password: ", password); // Log the entered password for comparison

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) {
        console.log("Password mismatch"); // Log if the password doesn't match
        return res.status(400).send("Invalid email or password.");
    }

    // Generate a JWT token using the correct secret key from the config
    const token = jwt.sign({ email }, config.jwtKey, { expiresIn: "1h" }); // Use config.jwtKey

    console.log("Token generated:", token); // Log the generated token for debugging

    res.status(200).send({ token });
});


module.exports = router;








