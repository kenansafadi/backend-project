
const express = require("express");
const _ = require("lodash");
const Joi = require("joi");
const router = express.Router();
const { User } = require("../model/users");


router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.json(user);
});

router.get("/", async (req, res) => {
    const users = await User.find();
    res.json(users);
});


router.put("/:id", async (req, res) => {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().min(2).max(255).optional(),
            middle: Joi.string().max(255).allow("").optional(),
            last: Joi.string().min(2).max(255).optional(),
        }).optional(),
        phone: Joi.string().pattern(/^\d{10}$/).optional(),
        image: Joi.object({
            url: Joi.string().uri().allow("").optional(),
            alt: Joi.string().allow("").optional(),
        }).optional(),
        address: Joi.object({
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            city: Joi.string().optional(),
            street: Joi.string().optional(),
            houseNumber: Joi.number().optional(),
            zip: Joi.number().optional(),
        }).optional(),
        isAdmin: Joi.boolean().optional(),
        isBusiness: Joi.boolean().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    console.log(user)
    const updatedData = _.omit(req.body, ["createdAt"]);
    Object.assign(user, updatedData);

    await user.save();
    res.json(_.pick(user, ["_id", "name", "phone", "address", "image", "isAdmin", "isBusiness"]));
});
router.patch("/:id", async (req, res) => {
    console.log('Request Body:', req.body);
    console.log('isBusiness:', req.body.isBusiness);

    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send("User not found");
    }

    let isBusiness = req.body.isBusiness;

    if (typeof isBusiness === 'string') {
        console.log(`isBusiness is a string, parsing it: ${isBusiness}`);
        isBusiness = isBusiness === 'true';
    }

    console.log('Normalized isBusiness:', isBusiness);

    if (typeof isBusiness !== 'boolean') {
        return res.status(400).send('Invalid value for isBusiness');
    }

    user.isBusiness = isBusiness;

    await user.save();
    res.json(_.pick(user, ["_id", "name", "isBusiness"]));
});


router.delete("/:id", async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
});
module.exports = router;
