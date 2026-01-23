const express = require('express');
const route = express.Router();
const ticketController = require('../controllers/ticket.controller');
const authMW = require('../middleWares/auth.mw');
const ticketMW = require('../middleWares/verifyTicketRequestBody.mw');
const authController = require('../controllers/auth.controller');


route.post('/tickets', [authMW.validateToken, ticketMW.validateTicketRequestBody], ticketController.createTicket);

module.exports = route;