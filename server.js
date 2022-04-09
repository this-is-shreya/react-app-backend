const express = require("express")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json())
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
dotenv.config({path:"./config.env"})
app.use(bodyParser.urlencoded({extended:true}))
const ObjectId = require('mongodb').ObjectID;

const fast2sms = require('fast-two-sms')
const otp = require("otp-generator")
const mongoose = require("mongoose")
const user = require("./models/user")
const borrow = require("./models/borrow")
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
         
})

app.post("/register-user",async(req,res)=>{
    console.log(req.body)
let doc = await user.find({phone:req.body.user.phone})
if(doc[0] != undefined && doc[0].is_verified == true){
res.json({already_verified:true,otp_sent:false})
}
else{
    let OTP = otp.generate(5,{lowerCaseAlphabets:false, upperCaseAlphabets: false, specialChars: false })
    let options = {authorization : process.env.API_KEY , message : 'The OTP for verification is: '+OTP ,  numbers : [req.body.user.phone]} 
    fast2sms.sendMessage(options)

if(doc[0] == undefined){
    
    const data = new user({
        name:req.body.user.name,
        phone:req.body.user.phone,
        gender:req.body.user.gender,
        otp:OTP,
        is_verified:false
    })
    data.save()

}
else if(doc[0].is_verified == false){
await user.findByIdAndUpdate(doc[0]._id,{
    $set:{
        otp:OTP
    }
})
}
res.json({already_verified:false,otp_sent:true})

}
})
app.post("/verify-otp",async(req,res)=>{

    let doc = await user.find({phone:req.body.user.phone})

    if(doc[0] != undefined && doc[0].otp == req.body.user.otp){
        await user.findByIdAndUpdate(doc[0]._id,{
            $set:{
                is_verified:true
            }
        })
        res.json({isVerify:true,id:doc[0]._id})
    }
    else{
        res.json({isVerify:false,id:doc[0]._id})

    }
})
app.post("/login-user",async(req,res)=>{
    console.log(req.body.user.name,req.body.user.phone)
    let doc = await user.find({name:req.body.user.name,phone:req.body.user.phone,is_verified:true})
    if(doc[0] != undefined){
        res.json({isVerif:true,id:doc[0]._id})
        }
        else{
            res.json({isVerif:false})
        }
})

app.post("/verify-user",async(req,res)=>{
if(Buffer.byteLength(req.body.user.id,'utf-8') != 24){
    console.log(Buffer.byteLength(req.body.user.id,'utf-8'))
    res.json({isVerif:false})

}
else{
    let doc = await user.find({_id:ObjectId(req.body.user.id)})
    if(doc[0] == undefined){
        res.json({isVerif:false})
    }
    else{
        res.json({isVerif:true})

    }
}

})

app.post("/borrow-request",async(req,res)=>{
    console.log(req.body.user.id)
    console.log(mongoose.Types.ObjectId(req.body.user.id))
    let doc = await user.find({_id:ObjectId(req.body.user.id)})
    // console.log(doc[0])
    const data = new borrow({
        amount:req.body.user.amount,
        duration:req.body.user.duration,
        reason:req.body.user.reason,
        upi:req.body.user.upi,
        requestor_phone:doc[0].phone
    })
    await data.save()
    res.json({isSaved:true})
})

app.listen(5000,()=>console.log("listening at 5000"))