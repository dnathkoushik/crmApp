const constants = require('../utils/constants');

const validateTicketRequestBody = (req, res, next) => {
    if(!req.body.title){
        return res.status(400).send({ message: "Title is required" });
    }
    if(!req.body.description){
        return res.status(400).send({ message: "Description is required" });
    }
    if(req.body.ticketPriority && (typeof req.body.ticketPriority !== 'number' || req.body.ticketPriority < 1 || req.body.ticketPriority > 5)){
        return res.status(400).send({ message: "Ticket Priority must be a number between 1 and 5" });
    }

    next();
}

const validateTicketStatus = (req, res, next) => {
    const validStatuses = constants.ticketStatuses;
    if(req.body.status && !Object.values(validStatuses).includes(req.body.status)){
        return res.status(400).send({ message: `Status must be one of the following: ${Object.values(validStatuses).join(', ')}` });
    }
    next();
}

module.exports = {
    validateTicketRequestBody: validateTicketRequestBody,
    validateTicketStatus: validateTicketStatus
};