const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// resetPasswordToken // It will generate the frontend link and send the mail // Reset password is same as Forgot password
exports.resetPasswordToken = async (req, res) => {
    try {
        // Extract email from req ki body
        // Check user for this email, email validation
        // Generate token(Here token means any unique string)
        // Update user by adding token and expiration time
        // Create url
        // Send mail with url

        // Extract email from req ki body
        const email = req.body.email; // (OR) const {email} = req.body;

        // Check user for this email, email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `
            });
        }

        // Generate token(Here token means any unique string)
        // const token = crypto.randomUUID(); // crypto.randomBytes() to generate a random token(unique string)
        const token = crypto.randomBytes(20).toString("hex"); // generates a random string of 20 bytes and converts it to a hexadecimal representation. This is commonly used to create unique tokens or identifiers.
        console.log("Backend token ", token);

        // Update User schema by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                            {email: email},
                                            {
                                                token: token,
                                                resetPasswordExpires: Date.now() + 3600000 // 1 hour expiration // 3600000 represents the number of milliseconds in one hour.
                                            },
                                            {new: true}
        );
        console.log("updatedDetails ", updatedDetails);

        // Create url
        const url = `https://studycircle.vercel.app/update-password/${token}`;

        // Send mail with url
        await mailSender(
			email,
			"Password Reset Link",
			`Your Link for email verification is ${url} . Please click this url to reset your password.`
		);

        res.json({
            success: true,
            message: "Email sent successfully, please check email and change password"
        });    
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending reset password mail."
        });  
    }
}

// resetPassword // It will update password in db
exports.resetPassword = async (req, res) => {
    try {
        // Extract data from req ki body
        // Validation
        // Get user details from DB using token
        // If no entry - Invalid token
        // Token time check
        // Hash password
        // Update password in DB

        // Extract data from req ki body
        const {password, confirmPassword, token} =  req.body; // Here token is const token = crypto.randomUUID(); which we generated above.

        // Validation
        if(password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not matching."
            });  
        }

        // Get user details from DB using token
        const userDetails = await User.findOne({token: token});
        console.log("userDetails ", userDetails);

        // If no entry - Invalid token
        if(!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid."
            });  
        }

        // Token time check
        if(!(userDetails.resetPasswordExpires > Date.now())) { // means userDetails.resetPasswordExpires < Date.now()
            return res.status(403).json({
                success: false,
                message: "Token is expired, please regenerate your token."
            });  
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in DB
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true}
        );

        res.status(200).json({
            success: true,
            message: "Password reset successfully."
        });  
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reseting password."
        });  
    }
}