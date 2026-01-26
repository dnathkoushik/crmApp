const Ticket = require('../models/ticket.model');

const validateCommentRequestBody = (req, res, next) => {
    if (!req.body.commentText || req.body.commentText.trim() === '') {
        return res.status(400).send({ message: 'Comment text is required' });
    }
    if(!req.params.ticketId || req.params.ticketId.trim() === ''){
        return res.status(400).send({ message: 'Ticket ID is required in the URL parameters' });
    }

    const ticket = Ticket.findById(req.params.ticketId);
    if (!ticket) {
        return res.status(400).send({ message: 'Invalid Ticket ID' });
    }

    next();
}

const validateTicketId = (req, res, next) => {
    if(!req.params.ticketId || req.params.ticketId.trim() === ''){
        return res.status(400).send({ message: 'Ticket ID is required in the URL parameters' });
    }
    const ticket = Ticket.findById(req.params.ticketId);
    if (!ticket) {
        return res.status(400).send({ message: 'Invalid Ticket ID' });
    }
    next();
}

module.exports = {
    validateCommentRequestBody : validateCommentRequestBody,
    validateTicketId : validateTicketId
}