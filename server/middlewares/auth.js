const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) => {
    try {
        // Extract token
        // If token missing, then return response
        // Verify the token
            // Verification issue

        // Extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

        // If token missing, then return response
        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing."
            });
        }

        // Verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("decode ", decode);
            req.user = decode; // Here we add decode data in request's user field // This allows you to access the decoded information downstream in your middleware or route handlers using req.user.
        }
        catch (error) {
            // Verification issue
            return res.status(401).json({
                success: false,
                message: "Token is Invalid."
            });
        }

        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token."
        });
    }
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Student only."
            });
        }

        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again."
        });
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructor only."
            });
        }

        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again."
        });
    }
}

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin only."
            });
        }

        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again."
        });
    }
}