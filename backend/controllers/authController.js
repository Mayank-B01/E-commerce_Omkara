const userModel = require('../models/userModel');
const {hashPassword} = require("../utils/authHelp.js");

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
                success: true,
                message: 'User already exists'
            })
        }

        const hashedPassword = await hashPassword(password);
        const userCreate =  await new userModel({
            name,
            email,
            phone,
            address,
            password:hashedPassword}).save();
        res.status(201).send({
            success: true,
            message: 'User created successfully',
            userCreate
        })
    }catch(err){
        console.log(err);
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

module.exports = {registerController};
