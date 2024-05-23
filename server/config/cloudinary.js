const cloudinary = require("cloudinary").v2; // imports the Cloudinary module and specifically version 2 (v2). // This allows the code to access Cloudinary's functionality.
require("dotenv").config();

exports.cloudinaryConnect = () => {
    try {
        cloudinary.config({ // cloudinary.config() function is a method provided by the Cloudinary Node.js SDK (Software Development Kit). // It is used to configure the connection between the Cloudinary service and a Node.js application.
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET
        });
    }
    catch (error) {
        console.log(error);
    }
}

// module.exports = cloudinaryConnect; // If you write above exports.cloudinaryConnect = () => {}; then no need to write this line.