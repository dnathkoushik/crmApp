const express = require('express');
const route = express.Router();
const userController = require('../controllers/user.controller');
const authMW = require('../middleWares/auth.mw');

//Route to get all users - only accessible by ADMIN users
route.get('/users', [authMW.validateToken, authMW.isAdmin], userController.findAllUsers);
route.put('/auth/changeStatus/:userId', [authMW.validateToken, authMW.isAdmin], userController.changeUserStatus);
route.get('/users/:userId', [authMW.validateToken, authMW.isAdmin], userController.findUserById);

module.exports = route;