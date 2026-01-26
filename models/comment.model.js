const mongoose = require('mongoose');
const constants = require('../utils/constants');

const commentSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    commenter: { //we will be using userId of the commenter
        type: String,
        required: true
    },
    commentText: {
        type: String,
        required: true
    }
}, { timestamps: true });


module.exports = mongoose.model('Comment', commentSchema);