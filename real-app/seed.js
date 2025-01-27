require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');
const { User } = require('./model/users');
const { generateBizNumber, Card, Address, Image } = require('./model/cards');
const userData = require('./UserData.json');
const cardData = require('./cardData.json');
const bcrypt = require("bcrypt");

// Connect to MongoDB and seed the database
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
        // Delete existing data
        await User.deleteMany();
        await Card.deleteMany();  // Optional: Keep this to clear the existing cards if needed
        await Address.deleteMany();
        await Image.deleteMany();

        // Hash passwords before inserting users
        const hashedUsers = await Promise.all(userData.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 12); // Hash the password
            return {
                ...user,
                password: hashedPassword, // Replace the password with the hashed version
            };
        }));

        // Insert hashed users
        const users = await User.insertMany(hashedUsers);
        console.log('Users seeded:', users.length);

        // Insert cards with user_id
        for (let card of cardData) {
            // Check if card already exists based on a unique field (e.g., title)
            const existingCard = await Card.findOne({ title: card.title });
            if (existingCard) {
                console.log(`Card with title "${card.title}" already exists. Skipping...`);
                continue;  // Skip this card if it already exists
            }

            // Choose a user to associate with the card
            const user = users[0];  // You can modify this logic if you need a specific user for each card

            // Create Address and Image
            const address = await Address.create(card.address);
            const image = await Image.create(card.image);
            card.address = address._id;
            card.image = image._id;
            card.user_id = user._id;  // Assign user_id to card

            // Generate a unique bizNumber for each card
            card.bizNumber = await generateBizNumber();

            // Create a new card using the modified data
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

