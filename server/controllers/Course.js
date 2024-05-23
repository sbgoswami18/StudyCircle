const Course = require("../models/Course");
const Category = require("../models/Category");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        // Extract data from req ki body
        // Extract file(thumbnail)
        // Convert the tag and instructions from stringified Array(from stringified JSON format) to actual Array
        // Validation
        // Get instructor details because in Course model we have instructor filed that's why we need it.
        // Validation for category
        // Upload image to cloudinary
        // Create a Course entry in DB
        // Add new course in the user schema of instructor in Courses array
        // Add the new course to the Category
        // Return response

        // Extract data from req ki body
        let {courseName, courseDescription, whatYouWillLearn, price, tag, category, status, instructions} = req.body; // Here category is objectId because in Course model we used Category as a reference

        // Extract file(thumbnail)
        const thumbnail = req.files.thumbnailImage;

        // Convert the tag and instructions from stringified Array(from stringified JSON format) to actual Array
        // Because in Course Model tag and instructions both are in Array formate.

        // console.log("tag", tag);
        // console.log("instructions", instructions);

        // const tag = JSON.parse(_tag);
        // const instructions = JSON.parse(_instructions);

        // Validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !category || !instructions.length || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Set default status
        if (!status || status === undefined) {
			status = "Draft";
		}

        // Get instructor details because in Course model we have instructor filed that's why we need it.
        const userId = req.user.id; // here userId is user ki simple id(Here id is in String). // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor"
        });
        console.log("Instructor Details ", instructorDetails);

        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found."
            });
        }
        // TODO:- Verify that userId = req.user.id and instructorDetails._id are same or not?

        // Validation for category
        const categoryDetails = await Category.findById(category); // Here category is objectId because in Course model we used Category as a reference
        if(!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found."
            });
        }

        // Upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Create a Course entry in DB
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id, // Here instructorDetails._id and req.user.id both are not same because instructorDetails._id is objectId and req.user.id is simple id(Here id is in String).
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id, // Here categoryDetails._id and category(which we extract from req.body above) are same, both are objectId.
            thumbnail: thumbnailImage.secure_url,
            status: status,
			instructions
        });

        // Add new course in the User schema of instructor in Courses array
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id}, // (OR) {instructorDetails._id} but {_id: instructorDetails._id} this is good for practise.
            {
                $push: {
                    courses: newCourse._id // Here newCourse._id is newCourse ki objectId.
                }
            },
            {new: true}
        );

        // Add the new course to the Category schema in Courses array
		await Category.findByIdAndUpdate(
			{_id: category},
			{
				$push: {
					courses: newCourse._id // Here newCourse._id is newCourse ki objectId.
				}
			},
			{ new: true }
		);

        // Return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully.",
            data: newCourse
        });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create Course.",
            error: error.message
        });
    }
}

// editCourse handler function
exports.editCourse = async (req, res) => {
    try {
        // Extract data from req ki body
        // Find Course
        // Validation
        // If Thumbnail Image is found, update it
        // Update only the fields that are present in the request body
        // Update the Course
        // Find the updated Course
        // Return response

        // Extract data from req ki body
        const { courseId } = req.body;
        const updates = req.body;

        // Find Course
        const course = await Course.findById(courseId);
        
        // Validation
        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }
    
        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }
    
        // Update only the fields that are present in the request body
        // This block of code loops through the updates object, which contains the fields to be updated for the course. For each field (key), it checks if it's "tag" or "instructions". If it is, it parses the JSON string in the updates[key] and assigns it to the corresponding course[key]. Otherwise, it directly assigns the value of updates[key] to course[key]. This ensures that only the fields present in the request body are updated, with special handling for fields that require JSON parsing.
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }
  
        // Update the Course
        await course.save()
    
        // Find the updated Course
        const updatedCourse = await Course.findOne({
            _id: courseId
        })
        .populate({
            path: "instructor",
            populate: {
                path: "additionalDetails"
            }
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
        path: "courseContent",
            populate: {
                path: "subSection"
            }
        })
        .exec()
    
        // Return response
        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// getAllCourses handler function
exports.getAllCourses = async (req, res) => {
    try {
        // Get all courses from DB
        // Return response

        // Get all courses from DB
        const allCourses = await Course.find(
            {status: "Published"},
            {
                courseName: true, // It fetches all documents from the Course collection from the database ke jema the courseName, price, thumbnail, instructor, ratingAndReviews and studentsEnrolled fields hoy j.
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true
            })
            .populate("instructor")
            .exec();
        
        // Return response
        return res.status(200).json({
            success: true,
            // message: "Data for all courses fetched successfully.",
            data: allCourses
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch courses data.",
            error: error.message
        });
    }
}

// getCourseDetails handler function
exports.getCourseDetails = async (req, res) => {
    try {
            // Extract courseId from req ki body
            // Find Course details
            // Validation
            // Return response

            // Extract courseId from req ki body
            const {courseId} = req.body;

            // Find Course details
            const courseDetails = await Course.findOne({_id: courseId})
                                                    .populate(
                                                        {
                                                            path: "instructor",
                                                            populate: {
                                                                path: "additionalDetails"
                                                            }
                                                        }
                                                    )
                                                    .populate("category")
                                                    .populate("ratingAndReviews")
                                                    .populate({
                                                        path: "courseContent",
                                                        populate: {
                                                            path: "subSection",
                                                            select: "-videoUrl"
                                                        }
                                                    })
                                                    .exec();

            // Validation
            if(!courseDetails) {
                return res.status(400).json({
                    success: false,
                    message: `Could not find the Course with ${courseId}`
                });
            }

            let totalDurationInSeconds = 0
                courseDetails.courseContent.forEach((content) => {
                content.subSection.forEach((subSection) => {
                    const timeDurationInSeconds = parseInt(subSection.timeDuration)
                    totalDurationInSeconds += timeDurationInSeconds
                })
            })

            const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

            // Return response
            return res.status(200).json({
                success: true,
                message: "Course Details fetched successfully",
                data: {
                    courseDetails,
                    totalDuration
                }
            });

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// getFullCourseDetails handler function
exports.getFullCourseDetails = async (req, res) => {
    try {
        // Extract courseId from req ki body
        const { courseId } = req.body

        const userId = req.user.id; // here userId is user ki simple id(Here id is in String). // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
        
        // Find Course
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails"
                }
            })
                .populate("category")
                .populate("ratingAndReviews")
                .populate({
                path: "courseContent",
                populate: {
                    path: "subSection"
                }
            })
            .exec()
  
        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })
    
        console.log("courseProgressCount : ", courseProgressCount)
    
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }
    
        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }
  
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })
    
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// getInstructorCourses handler function
// Get a list of Courses for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id; // here instructorId is user ki simple id(Here id is in String). // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
    
        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor: instructorId,
        }).sort({ createdAt: -1 })
    
        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor's courses",
            error: error.message
        });
    }
}

// deleteCourse handler function
exports.deleteCourse = async (req, res) => {
    try {
        // Get the courseId from the request body
        const { courseId } = req.body
  
        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }
    
        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }
    
        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }
    
            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }
    
        // Delete the course
        await Course.findByIdAndDelete(courseId)
    
        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}