const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: string,
        required: true
    },
    password: {
        type: string,
        required: true
    },
    rolse: [{
        type: string,
        default: "Employee"
    }],
    Active: {
        type: boolean,
        default: true
    }
})

module.exports = mongoose.model('User', userSchema)