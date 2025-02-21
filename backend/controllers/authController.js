const userModel = require('../models/userModel');
const {hashPassword} = require("../utils/authHelp.js");
const JWT = require('jsonwebtoken');
const {comparePassword} = require("../utils/authHelp");

const validatePhoneNumber = (number) => /^\d{10}$/.test(number);
const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#%*&$!]).{8,}$/.test(password);

const registerController = async (req, res) => {
    try{
        const {name,email, password, phone, answer} = req.body;
        //validation
        if(!name || !email || !password || !phone || !answer){
            return res.send({
                success: false,
                message: 'Please provide all the required fields'
            });
        }

        if (!validatePhoneNumber(phone)) {
            return res.status(400).send({
                success: false,
                message: "Phone number must be exactly 10 digits."
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).send({
                success: false,
                message: "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@,#,%,*,&,$,!)."
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
        const user = await new userModel({name,email, password:hashedPassword, phone:phone.trim(), answer}).save();
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
        const token = await JWT.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '5h'});
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

const userCount = async(req, res) =>{
    try{
        const count = await userModel.countDocuments({role:0});
        res.status(200).json({count});
    }catch (error){
        console.log('Error fetching user count:', error);
        res.status(500).json({error:'Failed to fetch user count'});
    }
}

const forgotPassController = async(req, res) =>{
    try{
        const {email, answer, newPassword} = req.body;
        if(!email){
            res.status(400).send({message:"Email is required"});
        }
        if(!answer){
            res.status(400).send({message:"Answer is required"});
        }
        if(!newPassword){
            res.status(400).send({message:"Password is required"});
        }

        //checking
        const user = await userModel.findOne({email, answer}, null, null)
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Wrong email or answer"
            })
        }

        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, {password:hashed},null)
        res.status(200).send({
            success:true,
            message:"Password Reset Successfully!"
            }
        );
    }catch (e) {
        console.log(e);
        res.status(500).send({
            success:false,
            message:"Something went wrong",
            e
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

module.exports = {registerController, loginController, testController, forgotPassController, userCount};
