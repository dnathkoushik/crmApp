const express = require('express');
const route = express.Router();
const ticketController = require('../controllers/ticket.controller');
const authMW = require('../middleWares/auth.mw');
const ticketMW = require('../middleWares/verifyTicketRequestBody.mw');
const authController = require('../controllers/auth.controller');
const commentController = require('../controllers/comment.controller');
const commentMW = require('../middleWares/verifyCommentRequestBody.mw');


route.post('/tickets', [authMW.validateToken, ticketMW.validateTicketRequestBody], ticketController.createTicket);
route.put('/tickets/:ticketId', [authMW.validateToken, ticketMW.validateTicketStatus], ticketController.updateTicket);
route.get('/tickets', authMW.validateToken, ticketController.getTickets);
route.get('/tickets/:ticketId', authMW.validateToken, ticketController.getTicketById);
route.post('/tickets/:ticketId/comments', [authMW.validateToken, commentMW.validateCommentRequestBody], commentController.createComment);
route.get('/tickets/:ticketId/comments', [authMW.validateToken, commentMW.validateTicketId], commentController.getCommentsByTicketId);

module.exports = route;