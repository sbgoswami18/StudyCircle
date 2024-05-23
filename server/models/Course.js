const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String
    },
    courseDescription: {
        type: String
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    whatYouWillLearn: {
        type: String
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview"
        }
    ],
    price: {
        type: Number
    },
    thumbnail: {
        type: String // This specifies that the field should contain a single string value.
    },
    tag: {
        type: [String], // This specifies that the field should contain an array of string values.
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: "Category"
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user"
        }
    ],
    instructions: {
        type: [String], // This specifies that the field should contain an array of string values.
	},
	status: {
		type: String,
		enum: ["Draft", "Published"]
	},
    createdAt: {
		type:Date,
		default:Date.now
	}
});

module.exports = mongoose.model("Course", courseSchema);