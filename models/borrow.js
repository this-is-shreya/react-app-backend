const mongoose = require("mongoose")
const Schema = mongoose.Schema

const borrow_request = new Schema({
    amount:Number,
    duration:Number,
    upi:String,
    reason:String,
    requestor_phone:String
})

module.exports = mongoose.model('borrow_request', borrow_request);