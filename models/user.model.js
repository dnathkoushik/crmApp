const moongoose = require('mongoose');
const constants = require('../utils/constants');

const userSchema = new moongoose.Schema({
    name : {
        type: String,
        required: true
    },
    userId : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true,
        minlength: 7
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: 10
    },
    userType : {
        type : String,
        enum : Object.values(constants.USER_TYPES),
        default : 'CUSTOMER',
        required: true
    },
    userStatus : {
        type : String,
        enum : Object.values(constants.USER_STATUS),
        default : 'APPROVED',
        required: true
    }
}, {timestamps: true});

module.exports = moongoose.model('User', userSchema);