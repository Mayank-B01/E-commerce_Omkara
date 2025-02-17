const JWT = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
//protected routes
// const requireSignIn = async(req, res, next) => {
//     try{
//         req.user = JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
//         next();
//     }catch (err) {
//         console.log(err);
//         res.status(401).send({
//             success: false,
//             message: 'Token not found'
//         });
//     }
// }
const requireSignIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token after "Bearer "
        if (!token) {
            return res.status(401).json({ success: false, message: "Token missing" });
        }
        req.user = JWT.verify(token, process.env.JWT_SECRET);
        console.log("Decoded user:", req.user)
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

//admin access
const isAdmin = async (req, res, next) => {
    try {
        console.log("Decoded User from Token:", req.user); // Check if req.user exists

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token",
            });
        }

        const user = await userModel.findById(req.user._id);
        console.log("User Found in DB:", user); // Check if user is found

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized Access - Not an Admin",
            });
        }

        next();
    } catch (error) {c
        console.error("Error in admin middleware:", error);
        res.status(500).json({
            success: false,
            error,
            message: "Server error in admin middleware",
        });
    }
};



module.exports = {requireSignIn, isAdmin};