const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// createSubSection
exports.createSubSection = async (req, res) => {
    try {
        // Extract data from req ki body
        // Extract video file
        // Validation
        // Upload video to cloudinary
        // Create a SubSection
        // Update the corresponding Section with the newly created SubSection's object id
        // Return response

        // Extract data from req ki body
        const {sectionId, title, description} = req.body;
        
        // Extract video file
        const video = req.files.video;

        // Validation
        if(!sectionId || !title || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Create a SubSection
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url
        });

        // Update the corresponding Section with the newly created SubSection's object id
        const updatedSection = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $push: {
                    subSection: subSectionDetails._id
                }
            },
            {new: true}
        ).populate("subSection");

        // Return response
        return res.status(200).json({
            success: true,
            message: "SubSection created successfully",
            data: updatedSection
        });
    }
    catch (error) {
        console.error("Error while creating new SubSection: ", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// updateSubSection
exports.updateSubSection = async (req, res) => {
    try {
        // Extract data from req ki body
        // Find SubSection from DB
        // Validation for subSection
        // Validation for title
        // Validation for description
        // Validation for video file
            // After upload new video to cloudinary update timeDuration and videoUrl fields
        // After updated all fields save subSection in DB
        // Find Section
        // Return response

        // Extract data from req ki body
        const {sectionId, subSectionId, title, description} = req.body;

        // Find SubSection from DB
        const subSection = await SubSection.findById(subSectionId);

        // Validation for subSection
        if(!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found."
            });
        }
        
        // Validation for title
        if(title !== undefined) {
            subSection.title = title;
        }

        // Validation for description
        if(description !== undefined) {
            subSection.description = description;
        }

        // Validation for video file
        if(req.files && req.files.video !== undefined) { // This condition checks if req.files exists and if it is exists then it will check if req.files.video is not undefined.(Both condition is essential)
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

            // After upload new video to cloudinary update timeDuration and videoUrl fields
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        // After updated all fields save subSection in DB
        await subSection.save(); // save -> used to save the changes into DB into the subSection.

        // Find Section
        const updatedSection = await Section.findById(sectionId).populate("subSection");

        // Return response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection updated successfully"
        });
    }
    catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the SubSection"
      });
    }
}

// deleteSubSection
exports.deleteSubSection = async (req, res) => {
    try {
        // Extract data from req ki body
        // Delete SubSection from Section schema and update Section
        // Delete SubSection fom SubSection schema
        // Validation
        // Find the updated Section
        // Return response

        // Extract data from req ki body
        const {subSectionId, sectionId} = req.body;

        // Delete SubSection from Section schema and update Section
        await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $pull: {
                    subSection: subSectionId
                }
            }
        );

        // Delete SubSection fom SubSection schema
        const subSection = await SubSection.findByIdAndDelete({_id: subSectionId});

        // Validation
        if(!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found."
            });
        }

        // Find the updated Section
        const updatedSection = await Section.findById(sectionId).populate("subSection")

        // Return response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully."
        });
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
      });
    }
}