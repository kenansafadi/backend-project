const PORT = 3005;
require('dotenv').config();
console.log('JWT_KEY:', process.env.JWT_KEY);
console.log('CONNECTION_ATLAS:', process.env.CONNECTION_ATLAS);

const mongoose = require("mongoose");
const express = require("express");
const usersRouter = require("./routes/userRoute")
const authRouter = require("./routes/auth");
const cardsRouter = require("./routes/cardRoute");
const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());


app.use("/api/users", usersRouter);

app.use("/api/auth", authRouter);
app.use("/api/cards", cardsRouter);

connect();

async function connect() {
    try {
        await mongoose.connect(process.env.CONNECTION_ATLAS);
        console.log("connected to db");


        app.listen(PORT, () => console.log(`listening on port ${PORT}`));
    } catch (e) {
        console.log("failed to connect to db", e.message);
    }
}

