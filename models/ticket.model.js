const mongoose = require('mongoose');
const constants = require('../utils/constants');
const { report } = require('../routes/user.route');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    ticketPriority: {
        type: Number,
        required: true,
        default: 4
    },
    description : {
        type: String,
        required: true
    },
    status : {
        type: String,
        required: true,
        default: constants.ticketStatuses.OPEN,
        enum: [constants.ticketStatuses.OPEN, constants.ticketStatuses.CLOSED, constants.ticketStatuses.BLOCKED]
    },
    reporter: { //we will be using userId of the reporter
        type: String,
        required: true
    },
    assignee: { //we will be using userId of the assignee
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
