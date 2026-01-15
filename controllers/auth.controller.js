/*
Here would be the implementation of the authentication controller.
*/

const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');

exports.signUp = async (req, res) => {
    // Sign up logic here
    const request_body = req.body;
    const userObj = {
        name: request_body.name,
        userId: request_body.userId,
        password: bcrypt.hashSync(request_body.password, 8),
        email: request_body.email,
        userType: request_body.userType,
    };

    try{
        const newUser = await userModel.create(userObj);
        const response = {
            name: newUser.name,
            userId: newUser.userId,
            email: newUser.email,
            userType: newUser.userType,
            userStatus: newUser.userStatus
        };
        res.status(201).send(response);
    } catch(err){
        console.log("Error while creating user", err);
        res.status(500).send({
            message: "Error while creating user"
        });
    }
};

exports.signIn = async (req, res) => {
    // Sign in logic here
    const request_body = req.body;
    try{
        const user = await userModel.findOne({ userId: request_body.userId });
        if(!user){
            return res.status(404).send({ message: "User not found" });
        }
        const passwordIsValid = bcrypt.compareSync(request_body.password, user.password);
        if(!passwordIsValid){
            return res.status(401).send({ message: "Invalid Password" });
        }
        const response = {
            name: user.name,
            userId: user.userId,
            email: user.email,
            userType: user.userType,
            userStatus: user.userStatus
        };
        res.status(200).send(response);
    } catch(err){
        console.log("Error while signing in", err);
        res.status(500).send({
            message: "Error while signing in"
        });
    }
};