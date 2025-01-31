const userModel = require('../models/userModel');
const {hashPassword} = require("../utils/authHelp.js");
const JWT = require('jsonwebtoken');
const {comparePassword} = require("../utils/authHelp");

const registerController = async (req, res) => {
    try{
        const {name,email, password, phone, address} = req.body;
        //validation
        if(!name || !email || !password || !phone || !address){
            return res.send({
                success: false,
                message: 'Please provide all the required fields'
            });
        }

        //existing user check
        const existingUser = await userModel.findOne({email}, null, null);
        if(existingUser){
            return res.status(200).send({
                success: false,
                message: 'User already exists'
            })
        }

        const hashedPassword = await hashPassword(password);
        const user = await new userModel({name,email, password:hashedPassword, phone, address}).save();
        res.status(201).send({
            success: true,
            message: 'User created successfully',
            user
        })
    }catch(err){
        console.log(err);
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

const loginController = async (req, res) => {
    try{
        const {email,password} = req.body;
        //validation
        if(!email || !password){
            return res.status(404).send({
                success: false,
                message:"Invalid Email or Password"
            })
        }

        //check user
        const user = await userModel.findOne({email}, null, null);
        if(!user){
            return res.status(404).send({
                success: false,
                message:"Email not registered"
            })
        }

        //check password
        const match = await comparePassword(password, user.password);
        if(!match){
            return res.status(200).send({
                success: false,
                message:"Invalid Password"
            })
        }
        //token
        const token = await JWT.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(200).send({
            success: true,
            message: "Logged in successfully",
            user:{
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role:user.role,
            },
            token,
        })
    }catch(err){
        console.log(err);
        res.status(500).send({
            success: false,
            message: "Error logging in",
            err
        })
    }
}

const testController =  (res,req) => {
    try{
        res.send("Protected route");
    }catch(err) {
        console.log(err);
        res.send({error: err.message});
    }
}

module.exports = {registerController, loginController, testController};
