//Logic to the signUp - Coustomer (A) / Engineer (p) / Admain (P)

const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const constants = require('../utils/constants');

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