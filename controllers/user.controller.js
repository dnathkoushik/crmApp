//This is the controller for user-related APIs
const User = require('../models/user.model');
const objectConverter = require('../utils/objectConverter');
const constants = require('../utils/constants');

//Controller to fetch all the users details
exports.findAllUsers = async (req, res) => {
    //start supporting the query params 
    let userTypeReq = req.query.userType;
    let userStatusReq = req.query.userStatus;
    const userQry = {};

    if (userTypeReq) {
        userQry.userType = userTypeReq;
    }
    if (userStatusReq) {
        userQry.userStatus = userStatusReq;
    }

    const users = await User.find(userQry);
    const userResponse = objectConverter.userResponse(users);
    res.status(200).json(userResponse);
};

//controller to find a user based on their userId
exports.findUserById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).send({ message: "User not found with the given userId" });
        }
        const userResponse = objectConverter.userResponse([user]);
        res.status(200).json(userResponse[0]);
    } catch (err) {
        console.log('Error while fetching user by ID', err);
        res.status(500).send({ message: "Internal Error while fetching user" });
    }
};

//controller to change the status of a user

exports.changeUserStatus = async (req, res) => {
    const userId = req.params.userId;
    const newStatus = req.body.userStatus;
    if(newStatus !== constants.USER_STATUS.APPROVED && newStatus !== constants.USER_STATUS.PENDING && newStatus !== constants.USER_STATUS.REJECTED){
        return  res.status(400).send({ message: "Invalid user status value" });
    }
    try {
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        user.userStatus = newStatus;
        await user.save();
        res.status(200).send({ message: "User status updated successfully" });
    } catch (err) {
        console.log('Error while changing user status', err);
        res.status(500).send({ message: "Internal Error while updating user status" });
    }
};

//controller to change userType 
exports.changeUserType = async (req, res) => {
    const userId = req.params.userId;
    const newType = req.body.userType;
    if(newType !== constants.USER_TYPES.CUSTOMER && newType !== constants.USER_TYPES.ENGINEER && newType !== constants.USER_TYPES.ADMIN){
        return  res.status(400).send({ message: "Invalid user type value" });
    }
    try {
        const user = await User.findOne({ userId: userId });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        user.userType = newType;
        await user.save();
        res.status(200).send({ message: "User type updated successfully" });
    } catch (err) {
        console.log('Error while changing user type', err);
        res.status(500).send({ message: "Internal Error while updating user type" });
    }
};

//controller to delete a user
exports.deleteUserById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findOneAndDelete({ userId: userId });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "User deleted successfully" });
    } catch (err) {
        console.log('Error while deleting user', err);
        res.status(500).send({ message: "Internal Error while deleting user" });
    }
};