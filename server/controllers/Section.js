const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// createSection
exports.createSection = async (req, res) => {
    try {
        // Extract data from req ki body
        // Validate data
        // Create section entry in DB
        // Update Course schema with section's objectId

        // Extract data from req ki body
        const {sectionName, courseId} = req.body;
        
        // Validate data
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties."
            });
        }

        // Create section entry in DB
        const newSection = await Section.create({sectionName});

        // Update Course schema with section's objectId
        const updatedCourse = await Course.findByIdAndUpdate(
                                                    courseId,
                                                    {
                                                        $push: {
                                                            courseContent: newSection._id
                                                        }
                                                    },
                                                    {new: true}
        )
        .populate({
            path: "courseContent", // When you populate courseContent, you're populating the Section. 
            populate: {
                path: "subSection", // Then within each Section document, you're populating the subSection.
            },
        })
        .exec();

		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse
		});
	}
    catch (error) {
		res.status(500).json({
			success: false,
			message: "Unable to create section, please try again.",
			error: error.message
		});
	}
}

// updateSection
exports.updateSection = async (req, res) => {
    try {
        // Extract data from req ki body
        // Update Section schema
        // Return response

        // Extract data from req ki body
        const {sectionName, sectionId, courseId} = req.body;

        // Update Section schema
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});

        // Find Course
        const courseDetails = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection"
			}
		})
		.exec();

        // Return response
		res.status(200).json({
			success: true,
			// message: "Section updated successfully",
            message: section,
            data: courseDetails
		});
	}
    catch (error) {
		console.error("Error while updating section: ", error);
		res.status(500).json({
			success: false,
            message: "Unable to update Section, please try again.",
			error: error.message
		});
	}
}

// deleteSection
exports.deleteSection = async (req, res) => {
    try {
        // Extract data from req ke params se
        // Delete Section(sectionId) from Course and update Course
        // Find Section
        // Validation for section
        // Delete All SubSection(SubSection's Id) from Section
        // Delete Section from DB
        // Find the updated Course 

        // Extract data from req ki body
        const {sectionId, courseId} = req.body;

        // Delete Section(sectionId) from Course and update Course
        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId
            }
        });

        // Find Section
        const section = await Section.findById(sectionId);

        // Validation for section
		if(!section) {
			return res.status(404).json({
				success: false,
				message: "Section not Found"
			});
		}

        // Delete All SubSection(SubSection's Id) from Section
        await SubSection.deleteMany({_id: {$in: section.subSection}}); // This will delete all SubSection documents whose _id is included in the section.subSection array. This ensures that when a Section is deleted, all its associated SubSections are also deleted from the database.

        // Delete Section from DB
        await Section.findByIdAndDelete(sectionId);

        // Find the updated Course 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success: true,
			message: "Section deleted successfully",
            data: course
		});
	}
    catch (error) {
		console.error("Error while deleting Section: ", error);
		res.status(500).json({
			success: false,
            message: "Unable to delete section, please try again.",
			error: error.message
		});
	}
}