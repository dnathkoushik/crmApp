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