//Logic to the signUp - Coustomer (A) / Engineer (p) / Admain (P)

const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const constants = require('../utils/constants');
const jwt = require('jsonwebtoken');
const config = require("./../configs/auth.config");

exports.signUp = async (req, res) => {
    const userObj = {
        name : req.body.name,
        userId : req.body.userId,
        email : req.body.email,
        userType : req.body.userType,
        password : bcrypt.hashSync(req.body.password, 8),
        userStatus : (!req.body.userType || req.body.userType === constants.USER_TYPES.CUSTOMER) ? constants.USER_STATUS.APPROVED : constants.USER_STATUS.PENDING
    }

    try{
        const newUser = await userModel.create(userObj);
        const postRes = {
            name : newUser.name,
            userId : newUser.userId,
            email : newUser.email,
            userType : newUser.userType,
            userStatus : newUser.userStatus,
            createdAt : newUser.createdAt,
            updatedAt : newUser.updatedAt
        }
        res.status(201).send(postRes);
    } catch(err){
        console.log('Error while signing up user', err);
        res.status(500).send({
            message: 'Internal Server Error, while creating user'
        });   
    }
};

exports.signIn = async (req, res) => {
    //Check if userId is present in req body
    const user = await userModel.findOne({ userId: req.body.userId });
    if(!user){
        return res.status(400).send({ message: "Failed! UserId does not exist" });
    }

    if(user.userStatus != constants.USER_STATUS.APPROVED){
        return res.status(400).send({ message: "Your account is not approved. Please wait for an admin to approve your account." });
    }

    //Check if password is correct
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if(!passwordIsValid){
        return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
        });
    }

    //Generate JWT signed token and return that
    const token = jwt.sign({ id: user.userId }, config.secret, {
        expiresIn: 120 
    });
    res.status(200).send({
        name : user.name,
        userId : user.userId,
        email : user.email,
        userStatus : user.userStatus,
        userType : user.userType,
        accessToken: token
    });
};