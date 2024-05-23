const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*5
    }
});

// A function to send mail
async function sendVerificationEmail(email, otp) {
	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
		console.log("Email sent successfully: ", mailResponse.response);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Below is defines a middleware function that will be executed before a document of the OTP schema is saved into the database.
OTPSchema.pre("save", async function(next) {
	console.log("New document saved to database");

    if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
    next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

// (OR)
// module.exports = mongoose.model("OTP", OTPSchema);