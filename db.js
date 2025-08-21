
const mongoose = require('mongoose');
require('dotenv').config();
// const url = "mngodb+srv://banko:mybanko123@cluster0.to9arvf.mongodb.net/";
const url = process.env.DB_URL;


async function connectDB() {
    try {
        await mongoose.connect(url);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
}

module.exports = connectDB;