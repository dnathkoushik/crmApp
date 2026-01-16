const express = require('express');
const route = express.Router();
const authController = require('../controllers/auth.controller');
const authMw = require('../middleWares/auth.mw');

//SignUp Route
route.post('/auth/signup', authMw.validateUserRequestBody, authController.signUp);

module.exports = route;