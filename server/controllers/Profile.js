const Profile = require("../models/Profile");
const Course = require("../models/Course")
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const CourseProgress = require("../models/CourseProgress")

// createProfile
// No need to write createProfile handler function here because we already create it in controllers->Auth->signup
// const profileDetails = await Profile.create({
//     gender: null,
//     dateOfBirth: null,
//     about: null,
//     contactNumber: null
// });

// updateProfile
exports.updateProfile = async (req, res) => {
    try {
        // Extract data from req ki body
        // Get user id from req.user
        // Find Profile
            // Firstly we will find "User" using "id"
            // Then find profileId
            // Then find profileDetails
        // Find User from DB and update its both fields(firstName and lastName)
        // After updated both fields(firstName and lastName), save userData in DB
        // Update Profile
        // After updated all fields, save profileDetails in DB
        // Find the updated User details from DB
        // Return response

        // Extract data from req ki body
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        } = req.body

        // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        const id = req.user.id; // (OR) const {id} = req.user;

        // Find Profile
        // Firstly we will find "User" using "id"
        const userDetails = await User.findById(id);
        // Then find profileId
        const profileId = userDetails.additionalDetails;
        // Then find profileDetails
        const profileDetails = await Profile.findById(profileId);

        // Find User from DB and update its both fields(firstName and lastName)
        const userData = await User.findByIdAndUpdate(id, {
            firstName,
            lastName
        });

        // After updated both fields(firstName and lastName), save userData in DB
        await userData.save(); // save -> Here used to save the changes into DB into the User.

        // Update Profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        // After updated all fields, save profileDetails in DB
        await profileDetails.save(); // save -> Here used to save the changes into DB into the Profile.

        // Find the updated User details from DB
        const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()

        // Return response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            updatedUserDetails
        });
    }
    catch (error) {
		console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// deleteAccount
// Explore:- How can we schedule this delete operation?
exports.deleteAccount = async (req, res) => {
    try {
        // TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);

        // Get user id from req.user
        // Validation
        // Delete Profile from DB
        // Unenroll User from all enrolled courses
        // Delete User from DB
        // Return response

        // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        const id = req.user.id; // (OR) const {id} = req.user;

        // Validation
        const userDetails = await User.findById({ _id: id });
        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Delete Profile from DB
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});

        // Unenroll User from all the enrolled courses
        for (const courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(
              courseId,
              { $pull: { studentsEnrolled: id } },
              { new: true }
            )
        }

        // Delete User from DB
        await User.findByIdAndDelete({_id: id});

        // Return response
        return res.status(200).json({
            success: true,
            message: "User deleted successfully."
        });
    }
    catch (error) {
		console.log(error);
        return res.status(500).json({
            success: false,
            message: "User can not be deleted."
        });
    }
}

// getAllUserDetails // This handler function will give a specific User's all details.
exports.getAllUserDetails = async (req, res) => {
    try {
        // Get user id from req.user
        // Find User from DB
        // Return response
            
        // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        const id = req.user.id; // (OR) const {id} = req.user;

        // Find User from DB
        const userDetails = await User.findById(id)
                                        .populate("additionalDetails")
                                        .exec()
        console.log("userDetails ", userDetails);

        // Return response
        res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: userDetails
        });
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
}

// updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
    try {
        // Extract DP from req ki files
        // Get user id from req.user
        // Upload image to cloudinary
        // Update User schema
        // Send response

        // Extract DP from req ki files
        const displayPicture = req.files.displayPicture;

        // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        const userId = req.user.id;

        // Upload image to cloudinary
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        console.log("image ", image);

        // Update User schema
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        );

        // Send response
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile
        });
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
};
  
// getEnrolledCourses
exports.getEnrolledCourses = async (req, res) => {
    try {
        // Get user id from req.user
        // Find User
        // Validation
        // Retuen response

        // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        const userId = req.user.id;

        // Find User
        let userDetails = await User.findOne({
            _id: userId,
        })
		.populate({
		  path: "courses",
		  populate: {
			path: "courseContent",
			populate: {
			  path: "subSection"
			}
		  }
		})
		.exec()

        userDetails = userDetails.toObject() // This converts the userDetails Mongoose document to a plain JavaScript object. This is useful if you need to modify the object directly.
        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
          let totalDurationInSeconds = 0
          SubsectionLength = 0
          for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
            totalDurationInSeconds += userDetails.courses[i].courseContent[j]
            .subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
            userDetails.courses[i].totalDuration = convertSecondsToDuration(
              totalDurationInSeconds
            )
            SubsectionLength +=
              userDetails.courses[i].courseContent[j].subSection.length
          }
          let courseProgressCount = await CourseProgress.findOne({
            courseID: userDetails.courses[i]._id,
            userId: userId,
          })
          courseProgressCount = courseProgressCount?.completedVideos.length
          if (SubsectionLength === 0) {
            userDetails.courses[i].progressPercentage = 100
          } else {
            // To make it up to 2 decimal point
            const multiplier = Math.pow(10, 2)
            userDetails.courses[i].progressPercentage =
              Math.round(
                (courseProgressCount / SubsectionLength) * 100 * multiplier
              ) / multiplier
          }
        }
    
        // Validation
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find User with id: ${userDetails}`
            });
        }

        // Retuen response
        return res.status(200).json({
            success: true,
            data: userDetails.courses
        });
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
};

// instructorDashboard
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id }) // Here courseDetails have, This instructor's(instructor: req.user.id) all courses in array form.

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats // The return courseDataWithStats statement inside the map function returns this newly created object for each course.
    })

    res.status(200).json({ courses: courseData }) // The response contains the courseData array, which includes each course with the additional statistics.
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}