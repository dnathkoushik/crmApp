//This is the controller for user-related APIs
const User = require('../models/user.model');
const objectConverter = require('../utils/objectConverter');

//Controller to fetch all the users details
exports.findAllUsers = async (req, res) => {
    const users = await User.find({});
    const userResponse = objectConverter.userResponse(users);
    res.status(200).json(userResponse);
};