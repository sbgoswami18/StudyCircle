const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator"); //  package for generating OTP
const mailSender = require("../utils/mailSender");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// signup
exports.signup = async (req, res) => {
    try {
        // Ftech data from req ki body
        // Validate data
        // Match 2 password
        // Check if user already exists
        // If user already exists then return response
        // Find most recent OTP stored in DB for the user
        // Validate otp
            // otp not found in db for the user, then return response 
            // Invalid otp, then return response
        // Hash password
        // Approved the instructor
        // Create entry in DB for User
        // For creating an entry in DB for User before that, make an entry for Profile in DB
        // return response successful

        // Ftech data from req ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // Validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Match 2 password
        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword value does not match, please try again."
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({email});

        // If user already exists then return response
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered."
            });
        }

        // Find most recent OTP stored in DB for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1); // OTP.find({email}) => This will return an array of OTP documents that match the email. // .sort({createdAt:-1}) => This part of the code sorts the results in descending order based on the createdAt field. The -1 value indicates descending order, meaning the most recent OTP will be at the beginning of the sorted array. This ensures that the most recent OTP is retrieved first. // .limit(1) => This part of the code limits the number of documents which is returned, to set just one.
        console.log("recentOtp:- ", recentOtp);

        // Validate otp
        if(recentOtp.length == 0) { // You can't write if(!recentOtp) instead of if(recentOtp.length == 0). Because recentOtp is an array returned from the find method, even if it's empty. So, recentOtp will always be truthy, even when it's empty.
            // otp not found in db for the user, then return response 
            return res.status(400).json({
                success: false,
                message: "The otp not found in db for the user."
            });
        }
        else if(otp !== recentOtp[0].otp) {
            // Invalid otp, then return response
            // console.log("otp ", otp);
            // console.log("recentOtp ", recentOtp[0].otp);
            return res.status(400).json({
                success: false,
                message: "Invalid otp."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Approved the instructor
        let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        // Create entry in DB for User

        // For creating an entry in DB for User before that, create a Profile and make an entry for Profile in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });
        
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber, // So, if you do not add contactNumber to the User model and you try to create a User instance with contactNumber, the field will not be stored in the database. This might not throw an error immediately Instead, it will simply ignore the contactNumber field because it is not defined in the User model. but it can lead to unexpected behavior later on if your application relies on the existence of the contactNumber field.
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        // return response successful
        return res.status(200).json({
            success: true,
            user,
            message: "User is registered successfully."
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again."
        });        
    }
}

// login
exports.login = async (req, res) => {
    try {
        // Ftech data from req ki body
        // Validate data
        // Check if user already exists or not
        // If user is not exists then return response
        // Generate JWT, after password matching
            // Create cookie and send response

        // Ftech data from req ki body
        const {email, password} = req.body;

        // Validate data
        if(!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required. Please try again."
            });
        }

        // Check if user already exists or not
        const user = await User.findOne({email}).populate("additionalDetails");

        // If user is not exists then return response
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered. please signup up"
            });
        }

        // Generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                eamil: user.email,
                id: user._id,
                accountType: user.accountType
            };
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h"
            });

            user.token = token;
            user.password = undefined; // For security purpose

            // Create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User Logged in successfully."
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect."
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
}

// sendotp
exports.sendotp = async (req, res) => {
    try {
        // Ftech email from req ki body
        // Check if user already exists
        // If user already exists then return response
        // Generate otp
        // Check unique otp or not
        // Create an entry in DB for OTP
        // return response successful

        // Ftech email from req ki body
        const {email} = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({email});

        // If user already exists then return response
        if(checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User is already registered."
            });
        }

        // Generate otp
        var otp = otpGenerator.generate(6, { // It will give only numberic otp because we write false for others.
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        
        // Check unique otp or not
        let result = await OTP.findOne({otp: otp});
        
        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            
            result = await OTP.findOne({otp: otp});
        }
        console.log("OTP generated: ", otp);

        const otpPayload = {email, otp};

        // Create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayload); // When we will create an entry of OTP in DB then otp will send before entry will save in DB because we used pre middleware in OTP model.
        console.log("otpBody ", otpBody);

        // return response successful
        res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            otp
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// changePassword
exports.changePassword = async (req, res) => {
    try {
        // Get user id from req.user
		// Get old password, new password, and confirm new password from req.body
		// Validate old password
            // If old password does not match, return a 401 (Unauthorized) error
		// Update password
        // Send notification email
			// If there's an error in sending the email, log the error and return a 500 (Internal Server Error) error
		// Return success response
		// If there's an error in updating the password, log the error and return a 500 (Internal Server Error) error

        // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
		const userDetails = await User.findById(req.user.id);

		// Get old password and new password from req.body
		const { oldPassword, newPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword, // Typed password by user
			userDetails.password // Real password from DB
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({
                success: false,
                message: "The password is incorrect"
            });
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);
        
        // Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
                "Password for your account has been updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error in sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
	} catch (error) {
		// If there's an error in updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};