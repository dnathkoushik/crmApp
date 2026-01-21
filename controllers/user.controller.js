//This is the controller for user-related APIs
const User = require('../models/user.model');
const objectConverter = require('../utils/objectConverter');

//Controller to fetch all the users details
exports.findAllUsers = async (req, res) => {
    const users = await User.find({});
    const userResponse = objectConverter.userResponse(users);
    res.status(200).json(userResponse);
};

exports.changeUserStatus = async (req, res) => {
    const userId = req.params.userId;
    const newStatus = req.body.userStatus;
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