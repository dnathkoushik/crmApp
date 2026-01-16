const userModel = require('../models/user.model');
const constants = require('../utils/constants');

exports.validateUserRequestBody = async (req, res, next) => {
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

