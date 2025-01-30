const JWT = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
//protected routes
const requireSignIn = async(req, res, next) => {
    try{
        req.user = JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
        next();
    }catch (err) {
        console.log(err);
        res.status(401).send({
            success: false,
            message: 'Roken not found'
        });
    }
}

//admin access

const isAdmin = async(req, res, next) => {
    try{
        const user = await userModel.findById(req.user._id, null, null);
        if (user.role !== 1){
            return res.status(401).send({
                success: false,
                message: 'Unauthorized Access'
            });
        } else {
            next();
        }
    }catch (error){
        console.log(error);
        res.status(401).send({
            success: false,
            error,
            message: 'Error in admin middleware'

        })
    }
}


module.exports = {requireSignIn, isAdmin};