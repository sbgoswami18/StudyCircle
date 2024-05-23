const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

// Create a new rating and review
// createRating
exports.createRating = async (req, res) => {
    try {
        // Get userId from req.user.id
        // Extract data from req ki body
        // Check if User is enrolled in Course or not
        // courseDetails validation
        // Check if User already reviewed the Course
        // Validation for alreadyReviewed
        // Create RatingAndReview
        // Return response

        // Get userId from req.user.id
        const userId = req.user.id; // here userId is user ki simple id(Here id is in String). // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        
        // Extract data from req ki body
        const {rating, review, courseId} = req.body;

        // Check if User is enrolled in Course or not
        const courseDetails = await Course.findOne(
                                        {   _id: courseId,
                                            studentsEnrolled: { // Here if we convert userId from String type to objectId type then also it will work. It is good practise to convert into objectId type.
                                                $elemMatch: {$eq: userId} // it's checking if the user is enrolled in the course by matching their userId with any element in the studentsEnrolled array. If there's a match, courseDetails will contain information about the course, indicating that the user is enrolled. If there's no match, courseDetails will be null, indicating that the user is not enrolled in the course.
                                            }
                                        }
        );

        // courseDetails validation
        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in this Course."
            });
        }

        // Check if User already reviewed the Course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                        user: userId,
                                                        course: courseId
        });

        // Validation for alreadyReviewed
        if(alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the User."
            });
        }

        // Create RatingAndReview
        const ratingReview = await RatingAndReview.create({
                                                    rating,
                                                    review,
                                                    course: courseId,
                                                    user: userId
        });

        // Add the rating and review to the course
        await Course.findByIdAndUpdate(courseId, {
            $push: {
            ratingAndReviews: ratingReview,
            },
        })
        await courseDetails.save()

        console.log("courseDetails ", courseDetails);

        // Return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review created successfully.",
            ratingReview
        });
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get the average rating for a course
// getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
        // Extract courseId from req ki body
        // Calculate avg rating
        // Return response
        // If no rating and review exist

        // Extract courseId from req ki body
        const courseId = req.body.courseId; // (OR) const {courseId} = req.body;

        // Calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId) // If we do not convert courseId from String to ObjectId then it is ok mongoDB will convert it automatically but it is good practise to convert it into ObjectId.
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating"}
                }
            }
        ]);

        // Return response
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            });
        }

        // If no rating and review exist
        return res.status(200).json({
            success: true,
            message: "Average rating is 0, no rating given till now",
            averageRating: 0
        });

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get all rating and reviews
// getAllRating
exports.getAllRating  = async (req, res) => {
    try {
        // Find RatingAndReview
        // Return response

        // Find RatingAndReview
        const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path: "user",
                                        select: "firstName lastName email image" // (OR) {firstName: true, lastName: true, email: true, image: true} // The select option in Mongoose's populate() method is used to specify which fields from the referenced document (in this case, the user document) should be included in the populated result.
                                    })
                                    .populate({
                                        path: "course",
                                        select: "courseName" // (OR) {courseName: true}
                                    })
                                    .exec();

        // Return response
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews
        });    
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}