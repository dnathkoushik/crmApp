const userModel = require('../models/user.model');
const constants = require('../utils/constants');
const jwt = require('jsonwebtoken');
const config = require("./../configs/auth.config");

exports.validateSignUpRequestBody = async (req, res, next) => {
    if(!req.body.name){
        return res.status(400).send({ message: "Name is required" });
    }
    if(!req.body.userId){
        return res.status(400).send({ message: "UserId is required" });
    }

    if(!req.body.password){
        return res.status(400).send({ message: "Password is required" });
    }

    //check userId is unique or not
    const user = await userModel.findOne({ userId: req.body.userId });
    if(user){
        return res.status(400).send({ message: "UserId already exists. Please choose a different UserId." });
    }

    if(!req.body.email){
        return res.status(400).send({ message: "Email is required" });
    }

    //check email is unique or not
    const user1 = await userModel.findOne({ email: req.body.email });
    if(user1){
        return res.status(400).send({ message: "Email already exists. Please choose a different Email." });
    }

    //check userType is valid or not
    const validUserTypes = [...Object.values(constants.USER_TYPES)];
    if(req.body.userType && !validUserTypes.includes(req.body.userType)){
        return res.status(400).send({ message: "Invalid userType. Valid types are " + validUserTypes.join(', ') });
    }
    
    next();
};

exports.validateSignInRequestBody = async (req, res, next) => {
    if(!req.body.userId){
        return res.status(400).send({ message: "UserId is required" });
    }
    if(!req.body.password){
        return res.status(400).send({ message: "Password is required" });
    }

    next();
};

exports.validateToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        next();
    });
};

exports.isAdmin = async (req, res, next) => {
    const user = await userModel.findOne({ userId: req.userId });
    if (user && user.userType === constants.USER_TYPES.ADMIN) {
        next();
        return;
    }
    res.status(403).send({
        message: "Require Admin Role!"
    });
};
