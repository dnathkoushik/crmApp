const express = require('express');
const route = express.Router();
const authController = require('../controllers/auth.controller');
const authMw = require('../middleWares/auth.mw');

//SignUp Route
route.post('/auth/signup', authMw.validateSignUpRequestBody, authController.signUp);
route.post('/auth/signin', authMw.validateSignInRequestBody, authController.signIn);
route.put('/auth/changeStatus/:userId', [authMw.validateToken, authMw.isAdmin], authController.changeUserStatus);
module.exports = route;