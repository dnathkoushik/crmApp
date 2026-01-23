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
        res.status(201).send({
            title: newTicket.title,
            ticketPriority: newTicket.ticketPriority,
            description: newTicket.description,
            status: newTicket.status,
            reporter: newTicket.reporter,
            assignee: newTicket.assignee,
        });
    } catch(err){
        console.log('Error while creating ticket', err);
        res.status(500).send({
            message: 'Internal Server Error while creating ticket'
        });
    }
};