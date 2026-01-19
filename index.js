const express = require('express');
const app = express();
require('dotenv').config();
const user = require('./models/user.model');
const bcrypt = require('bcryptjs');


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

        //Check if the admin user exists, if not create one
        const adminUser = await user.findOne({ userId: 'admin' });
        if (!adminUser) {
            const newAdmin = await user.create({
                name: 'Koushik',
                userId: 'admin',
                password: bcrypt.hashSync('Admin@123', 10),
                email: 'dnathkoushik@gmail.com',
                userType: 'ADMIN'
            });
            console.log("Admin user created");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectDB();

//Middleware to parse JSON requests
app.use(express.json());

//Importing and using the auth routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
app.use('/crmApp/api/v1', authRoutes);
app.use('/crmApp/api/v1', userRoutes);