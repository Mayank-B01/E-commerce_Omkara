const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const {hashPassword, comparePassword} = require("../utils/authHelp.js");
const JWT = require('jsonwebtoken');

const validatePhoneNumber = (number) => /^\d{10}$/.test(number);

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
        // Find user and populate cart details
        const user = await userModel.findOne({email}).populate({
            path: 'cart.product',
            select: 'name price photo slug description sizes quantity category',
            populate: {
                path: 'category',
                select: 'name'
            }
        });
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
            cart: user.cart || [] // Include the populated cart in the response
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

// Controller to get all users (Admin only), optionally filtered by role
const getAllUsersController = async (req, res) => {
    try {
        // Build filter object based on query parameter
        const filter = {};
        if (req.query.role) {
            const role = parseInt(req.query.role, 10);
            // Basic validation: ensure role is 0 or 1
            if (!isNaN(role) && (role === 0 || role === 1)) {
                filter.role = role;
            } else {
                // Optional: Handle invalid role query param, e.g., return error or ignore
                console.log(`Invalid role query parameter received: ${req.query.role}. Fetching all users.`);
                // Or: return res.status(400).send({ success: false, message: "Invalid role specified" });
            }
        }

        // Find users based on filter, exclude password field
        console.log("Fetching users with filter:", filter); // Log the filter being used
        const users = await userModel.find(filter).select("-password");

        res.status(200).send({
            success: true,
            message: `Users ${Object.keys(filter).length > 0 ? 'filtered by role ' + filter.role : ''} fetched successfully`,
            count: users.length,
            users: users,
        });
    } catch (error) {
        console.log("Error fetching all users:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching users",
            error: error.message,
        });
    }
};

// Controller to delete a user (Admin only)
const deleteUserController = async (req, res) => {
    try {
        const userIdToDelete = req.params.userId;
        const currentAdminId = req.user.id; // From requireSignIn middleware

        // Prevent self-deletion
        if (userIdToDelete === currentAdminId) {
            return res.status(403).send({
                success: false,
                message: "Admin cannot delete their own account.",
            });
        }

        // Find and delete the user
        const deletedUser = await userModel.findByIdAndDelete(userIdToDelete);

        if (!deletedUser) {
            return res.status(404).send({
                success: false,
                message: "User not found for deletion.",
            });
        }

        res.status(200).send({
            success: true,
            message: `User "${deletedUser.name}" deleted successfully`,
            deletedUser: { // Optionally return basic info of deleted user
                _id: deletedUser._id,
                name: deletedUser.name,
                email: deletedUser.email
            }
        });

    } catch (error) {
        console.log("Error deleting user:", error);
        // Handle potential CastError if userIdToDelete format is invalid
        if (error.name === 'CastError') {
             return res.status(400).send({
                success: false,
                message: "Invalid user ID format.",
                error: error.message,
            });
        }
        res.status(500).send({
            success: false,
            message: "Error deleting user",
            error: error.message,
        });
    }
};

module.exports = {registerController, loginController, testController, forgotPassController, userCount, productCount, updateProfileController, updatePasswordController, getAllUsersController, deleteUserController};
