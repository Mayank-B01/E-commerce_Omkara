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
    answer:{
        type:String,
        required:true
    },
    role:{
        type:Number,
        default:0,
    },
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products', // Reference the 'Products' model
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            size: {
                type: String,
                required: false // Or true, depending if size is always required
            }
        }
    ]
},{timestamps:true})

module.exports =  mongoose.model('users', userSchema);