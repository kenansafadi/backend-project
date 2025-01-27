const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Auth } = require("../model/auth"); // Reference to Auth model
const { User, validateUser } = require("../model/users");
const config = require("../config/config");

const router = express.Router();



router.post("/register", async (req, res) => {
    console.log(req.body);

    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const userData = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: hashedPassword,
        address: req.body.address,
        isBusiness: req.body.isBusiness
    };

    if (req.body.image && req.body.image.url !== '' && req.body.image.alt !== '') {
        userData.image = req.body.image;
    }

    user = new User(userData);
    await user.save();

    const auth = new Auth({
        email: req.body.email,
        password: hashedPassword
    });
    await auth.save();

    res.status(201).send("User registered successfully");
});

router.post("/login", async (req, res) => {
    console.log("Login route hit");

    const { email, password } = req.body;
    console.log("Request body:", req.body);


    const auth = await Auth.findOne({ email });
    if (!auth) {
        console.log("User not found");
        return res.status(400).send("Invalid email or password.");
    }

    console.log("Stored password: ", auth.password);
    console.log("Entered password: ", password);

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) {
        console.log("Password mismatch");
        return res.status(400).send("Invalid email or password.");
    }

    const token = jwt.sign({ email }, config.jwtKey, { expiresIn: "1h" });

    console.log("Token generated:", token);

    res.status(200).send({ token });
});


module.exports = router;








