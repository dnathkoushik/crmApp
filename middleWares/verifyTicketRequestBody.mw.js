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

module.exports = {
    validateTicketRequestBody : validateTicketRequestBody
};