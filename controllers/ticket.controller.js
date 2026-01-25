//Define the controller to create a new ticket
//As soon as a ticket is created, it should be auto assigned to an engineer
const ticketModel = require('../models/ticket.model');
const userModel = require('../models/user.model');
const constants = require('../utils/constants');

exports.createTicket = async (req, res) => {
    const ticketObj = {
        title: req.body.title,
        ticketPriority: req.body.ticketPriority,
        description: req.body.description,
        status: req.body.status,
        reporter: req.userId, //this userId will be set at the MW layer, during authentication
    };

    //Auto assign the ticket to an engineer
    //I have to find an engineer whivh is in APPROVED state
    const engineer = await userModel.findOne({ userType: constants.USER_TYPES.ENGINEER, userStatus: constants.USER_STATUS.APPROVED });
    if(engineer){
        ticketObj.assignee = engineer.userId;
    }
    try{
        const newTicket = await ticketModel.create(ticketObj);
        res.status(201).send(newTicket);
    } catch(err){
        console.log('Error while creating ticket', err);
        res.status(500).send({
            message: 'Internal Server Error while creating ticket'
        });
    }
};

exports.updateTicket = async (req, res) => {
    const ticketId = req.params.ticketId;

    const ticket = await ticketModel.findOne({ _id: ticketId });
    const callingUserDetails = await userModel.findOne({ userId: req.userId });

    //I want to check if the right user is updating the ticket
    if(ticket.reporter !== req.userId && ticket.assignee !== req.userId && callingUserDetails.userType !== constants.USER_TYPES.ADMIN){
        return res.status(403).send({
            message: 'Forbidden: You cannot update this ticket'
        });
    }
    try{
        ticket.title = req.body.title ? req.body.title : ticket.title;
        ticket.ticketPriority = req.body.ticketPriority ? req.body.ticketPriority : ticket.ticketPriority;
        ticket.description = req.body.description ? req.body.description : ticket.description;
        ticket.status = req.body.status ? req.body.status : ticket.status;
        ticket.assignee = req.body.assignee ? req.body.assignee : ticket.assignee;

        const updatedTicket = await ticket.save();
        res.status(200).send(updatedTicket);
    } catch(err){
        console.log('Error while updating ticket', err);
        res.status(500).send({
            message: 'Internal Server Error while updating ticket'
        });
    }
};

