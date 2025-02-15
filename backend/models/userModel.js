const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:false ,
        unique:true,
        sparse:true,
    },
    address:{
        type:String,
        required:false,
    },
    role:{
        type:Number,
        default:0,
    }
},{timestamps:true})

module.exports =  mongoose.model('users', userSchema);