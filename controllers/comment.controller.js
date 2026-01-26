//Controller to create a comment on a ticket
const commentModel = require('../models/comment.model');
const ticketModel = require('../models/ticket.model');
const userModel = require('../models/user.model');
const constants = require('../utils/constants');

exports.createComment = async (req, res) => {
    const commentObj = {
        ticketId: req.params.ticketId,
        commenter: req.userId, //this userId will be set at the MW layer, during authentication
        commentText: req.body.commentText
    };
    //Check if ticket exists
    const ticket = await ticketModel.findOne({ _id: commentObj.ticketId });
    if(!ticket){
        return res.status(400).send({ message: "Failed! Ticket does not exist" });
    }
    //Check if the user is either reporter, assignee or admin
    const savedUser = await userModel.findOne({ userId: req.userId });
    if(ticket.reporter !== req.userId && ticket.assignee !== req.userId && savedUser.userType !== constants.USER_TYPES.ADMIN){
        return res.status(403).send({
            message: 'Forbidden: You cannot comment on this ticket'
        });
    }
    try{
        const newComment = await commentModel.create(commentObj);
        res.status(201).send(newComment);
    }
    catch(err){
        console.log('Error while creating comment', err);
        res.status(500).send({
            message: 'Internal Server Error while creating comment'
        });
    }
};

//get all comments for a ticket
exports.getCommentsByTicketId = async (req, res) => {
    const ticketId = req.params.ticketId;
    try{
        const comments = await commentModel.find({ ticketId: ticketId });
        res.status(200).send(comments);
    }
    catch(err){
        console.log('Error while fetching comments', err);
        res.status(500).send({
            message: 'Internal Server Error while fetching comments'
        });
    }
};