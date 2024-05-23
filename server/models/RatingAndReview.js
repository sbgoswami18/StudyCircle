const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true, // Setting index: true on a field in a Mongoose schema creates an index for that field in MongoDB. Indexes improve query performance by helping MongoDB quickly find documents based on the indexed field. It's beneficial for fields which you frequently query.
	},
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);