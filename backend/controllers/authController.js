const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const {hashPassword, comparePassword} = require("../utils/authHelp.js");
const JWT = require('jsonwebtoken');

const validatePhoneNumber = (number) => /^\d{10}$/.test(number);
// Relaxed password validation for update, ensure frontend enforces complexity if needed
// const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#%*&$!]).{8,}$/.test(password);

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

        // Stronger validation on registration
        const strongValidatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#%*&$!]).{8,}$/.test(password);
        if (!strongValidatePassword(password)) {
            return res.status(400).send({
                success: false,
                message: "Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@,#,%,*,&,$,!)."
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
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt
            }
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
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt
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

const productCount = async(req, res) =>{
    try{
        const count = await productModel.countDocuments();
        res.status(200).json({count});
    }catch (error){
        console.log('Error fetching product count:', error);
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

// Update Profile Controller
const updateProfileController = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const user = await userModel.findById(req.user.id);
        // password check can be added if needed

        // Validate phone if provided
        if (phone && !validatePhoneNumber(phone)) {
            return res.status(400).send({
                success: false,
                message: "Phone number must be exactly 10 digits."
            });
        }

        // Update user fields
        const updatedUser = await userModel.findByIdAndUpdate(req.user.id, {
            name: name || user.name,
            email: email || user.email, // Consider if email change needs verification
            phone: phone || user.phone,
            address: address || user.address,
        }, { new: true }); // {new: true} returns the updated document

        res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            updatedUser: {
                 _id: updatedUser._id,
                 name: updatedUser.name,
                 email: updatedUser.email,
                 phone: updatedUser.phone,
                 address: updatedUser.address,
                 role: updatedUser.role,
                 createdAt: updatedUser.createdAt
            },
        });

    } catch (error) {
        console.log("Error updating profile:", error);
        res.status(500).send({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};

// Update Password Controller
const updatePasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
             return res.status(400).send({
                success: false,
                message: "Current and new passwords are required."
            });
        }

        const user = await userModel.findById(req.user.id);
        if (!user) {
             return res.status(404).send({
                success: false,
                message: "User not found."
            });
        }

        // Compare current password
        const match = await comparePassword(currentPassword, user.password);
        if (!match) {
             return res.status(400).send({
                success: false,
                message: "Incorrect current password."
            });
        }

        // Basic validation for new password length (can add complexity rules)
        if (newPassword.length < 8) {
            return res.status(400).send({
                success: false,
                message: "New password must be at least 8 characters long."
            });
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).send({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.log("Error updating password:", error);
        res.status(500).send({
            success: false,
            message: "Error updating password",
            error: error.message
        });
    }
};

module.exports = {registerController, loginController, testController, forgotPassController, userCount, productCount, updateProfileController, updatePasswordController};
