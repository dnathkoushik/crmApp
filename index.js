const express = require('express');
const app = express();
require('dotenv').config();


//Start a server at the specified PORT
const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Code to make a connection with mongoDB
const mongoose = require('mongoose');   

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectDB();

//Middleware to parse JSON requests
app.use(express.json());