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

/*
    Fetching tickets based on user roles
    1. Admin should get all tickets
    2. Engineer should get tickets assigned to him/her
    3. Customer should get tickets created by him/her
*/

exports.getTickets = async (req, res) => {
    const callingUserDetails = await userModel.findOne({ userId: req.userId });
    let tickets;
    try{
        if(callingUserDetails.userType === constants.USER_TYPES.ADMIN){
            //get all tickets
            tickets = await ticketModel.find();
        } else if(callingUserDetails.userType === constants.USER_TYPES.ENGINEER){
            //get tickets assigned to this engineer
            tickets = await ticketModel.find({ assignee: req.userId });
        } else {
            //get tickets created by this customer
            tickets = await ticketModel.find({ reporter: req.userId });
        }
        res.status(200).send(tickets);
    } catch(err){
        console.log('Error while fetching tickets', err);
        res.status(500).send({
            message: 'Internal Server Error while fetching tickets'
        });
    }
};

//API to get all tickets
exports.getAllTickets = async (req, res) => {
    try{
        const tickets = await ticketModel.find();
        res.status(200).send(tickets);
    } catch(err){
        console.log('Error while fetching tickets', err);
        res.status(500).send({
            message: 'Internal Server Error while fetching tickets'
        });
    }
};

//api to delete all the ticket
exports.deleteAllTickets = async (req, res) => {
    try{
        await ticketModel.deleteMany();
        res.status(200).send({
            message: 'All tickets deleted successfully'
        });
    } catch(err){
        console.log('Error while deleting tickets', err);
        res.status(500).send({
            message: 'Internal Server Error while deleting tickets'
        });
    }
};

//API to get ticket by ticketId
exports.getTicketById = async (req, res) => {
    const ticketId = req.params.ticketId;
    try{
        const ticket = await ticketModel.findOne({ _id: ticketId });
        const savedUser = await userModel.findOne({ userId: req.userId });

        //I want to check if the right user is fetching the ticket
        if(ticket.reporter !== req.userId && ticket.assignee !== req.userId && savedUser.userType !== constants.USER_TYPES.ADMIN){
            return res.status(403).send({
                message: 'Forbidden: You cannot access this ticket'
            });
        } 
        res.status(200).send(ticket);
    }
    catch(err){
        console.log('Error while fetching ticket by id', err);
        res.status(500).send({
            message: 'Internal Server Error while fetching ticket by id'
        });
    }
};

//API to delete ticket by ticketId
exports.deleteTicketById = async (req, res) => {
    const ticketId = req.params.ticketId;
    try{
        await ticketModel.deleteOne({ _id: ticketId });
        res.status(200).send({
            message: 'Ticket deleted successfully'
        });
    }
    catch(err){
        console.log('Error while deleting ticket by id', err);
        res.status(500).send({
            message: 'Internal Server Error while deleting ticket by id'
        });
    }
};