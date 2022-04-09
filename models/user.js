const mongoose = require("mongoose")
const Schema = mongoose.Schema

const user_borrow = new Schema({
    name:String,
    phone:String,
    gender:String,
    otp:String,
    is_verified:Boolean
})

module.exports = mongoose.model('user_borrow', user_borrow);