const express = require("express");
const router = express.Router();
const { generateBizNumber, validateCard, Card, Address, Image } = require("../model/cards");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");
const Joi = require('joi');

router.get("/", async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (error) {
        console.error("Error fetching all cards:", error.message);
        res.status(500).json({ message: "Error retrieving all cards" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const cardId = req.params.id.trim();

        if (!mongoose.Types.ObjectId.isValid(cardId)) {
            return res.status(400).json({ message: "Invalid card ID format" });
        }

        const card = await Card.findById(cardId)
            .populate('address')
            .populate('image');

        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        res.json(card);
    } catch (error) {
        console.error("Error fetching card by ID:", error.message);
        res.status(500).json({ message: "Error retrieving card" });
    }
});

router.get("/my-cards/:userId", authMiddleware, async (req, res) => {
    try {
        const cards = await Card.find({ user_id: req.params.userId });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user cards" });
    }
});


router.post("/", authMiddleware, async (req, res) => {
    try {
        const { error } = validateCard(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let address;
        if (req.body.address) {
            address = await Address.create(req.body.address);
        }

        let image;
        if (req.body.image && req.body.image.url) {
            image = await Image.create(req.body.image);
        }

        const bizNumber = await generateBizNumber();

        const card = new Card({
            ...req.body,
            bizNumber: bizNumber,
            user_id: req.user._id,
            address: address ? address._id : undefined,
            image: image ? image._id : undefined,
        });

        await card.save();
        res.status(201).json(card);
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({ message: "Error creating card" });
    }
});


router.put("/:id", async (req, res) => {
    const { error } = validateCard(req.body, true);
    if (error) return res.status(400).send(error.details[0].message);

    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("Business card not found.");



    card.title = req.body.title || card.title;
    card.subtitle = req.body.subtitle || card.subtitle;
    card.description = req.body.description || card.description;
    card.phone = req.body.phone || card.phone;
    card.email = req.body.email || card.email;
    card.web = req.body.web || card.web;

    if (req.body.image) {
        card.image = req.body.image.url ?
            (await Image.findOneAndUpdate({ _id: card.image }, { url: req.body.image.url, alt: req.body.image.alt || "" }, { new: true })) :
            card.image;
    }

    if (req.body.address) {
        card.address = req.body.address.state
            ? (await Address.findOneAndUpdate({ _id: card.address }, req.body.address, { new: true }))
            : card.address;
    }

    if (req.body.likes) {
        card.likes = req.body.likes;
    }

    try {
        await card.save();
        res.status(200).send(card);
    } catch (err) {
        res.status(500).send("Error saving the updated card: " + err.message);
    }
});

router.patch("/like/:id", authMiddleware, async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send("Card not found");

        if (card.likes?.includes(req.user._id)) {
            card.likes = card.likes.filter((id) => id !== req.user._id.toString());
        } else {
            card.likes.push(req.user._id);
        }

        await card.save();
        res.json(card);
    } catch (error) {
        res.status(500).json({ message: "Error toggling like" });
    }
});


router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const cardId = req.params.id.trim();

        if (!mongoose.Types.ObjectId.isValid(cardId)) {
            return res.status(400).json({ message: "Invalid card ID format" });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        if (card.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        await card.deleteOne();
        res.json({ message: "Card deleted successfully" });
    } catch (error) {
        console.error("Error deleting card:", error.message);
        res.status(500).json({ message: "Error deleting card" });
    }
});


module.exports = router;
