const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        accountType: {
            type: String,
            enum: ["Admin", "Student", "Instructor"],
            required: true
        },
        active: {
            type: Boolean,
            default: true
        },
        approved: {
            type: Boolean,
            default: true
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Profile"
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            }
        ],
        token: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
        image: {
            type: String,
            required: true
        },
        courseProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "courseProgress"
            }
        ]
    },
    // Add timestamps for when the document is created and last modified
    {
        timestamps: true // The { timestamps: true } option in Mongoose schema automatically adds two fields, createdAt and updatedAt, to the documents in the collection. These fields track when the document was created and last updated, respectively. This option simplifies managing timestamps in your application, as Mongoose automatically handles updating these fields whenever a document is created or modified.
    }
);

module.exports = mongoose.model("user", userSchema);