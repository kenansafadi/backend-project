require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');
const { User } = require('./model/users');
const { generateBizNumber, Card, Address, Image } = require('./model/cards');
const userData = require('./UserData.json');
const cardData = require('./cardData.json');
const bcrypt = require("bcrypt");

mongoose.connect(process.env.CONNECTION_ATLAS)
    .then(() => {
        console.log('Connected to MongoDB!');
        seedDatabase();
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });


async function seedDatabase() {
    try {
        await User.deleteMany();
        await Card.deleteMany();
        await Address.deleteMany();
        await Image.deleteMany();

        const hashedUsers = await Promise.all(userData.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 12);
            return {
                ...user,
                password: hashedPassword,
            };
        }));

        const users = await User.insertMany(hashedUsers);
        console.log('Users seeded:', users.length);

        for (let card of cardData) {
            const existingCard = await Card.findOne({ title: card.title });
            if (existingCard) {
                console.log(`Card with title "${card.title}" already exists. Skipping...`);
                continue;
            }

            const user = users[0];

            const address = await Address.create(card.address);
            const image = await Image.create(card.image);
            card.address = address._id;
            card.image = image._id;
            card.user_id = user._id;

            card.bizNumber = await generateBizNumber();

            const newCard = await Card.create(card);
            console.log('Card seeded:', newCard.title);
        }

        console.log('Database seeding completed!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error during seeding:', error.message);
        mongoose.connection.close();
    }
}

