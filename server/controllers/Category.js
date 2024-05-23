const Category = require("../models/Category");
const { Mongoose } = require("mongoose");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// createCategory Handler Function
exports.createCategory = async (req, res) => {
    try {
        // Extract data from req ki body
        // Validation
        // Create entry in DB
        // Return response

        // Extract data from req ki body
        const {name, description} = req.body;

        // Validation
        if(!name) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Create entry in DB
        const CategoryDetails = await Category.create({
            name: name,
            description: description
        });
        console.log("CategoryDetails ", CategoryDetails);

        // Return response
        return res.status(200).json({
            success: true,
            message: "Category created successfully."
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// showAllCategories Handler Function
exports.showAllCategories = async (req, res) => {
    try {
        // Get all categories from DB
        // Return response

        // Get all categories from DB
        const allCategorys = await Category.find({});

        // Return response
        return res.status(200).json({
            success: true,
            data: allCategorys
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// categoryPageDetails Handler Function
exports.categoryPageDetails = async (req, res) => {
    try {
        // Extract category id from req ki body
        const {categoryId} = req.body;

        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
                                                .populate({
                                                    path: "courses",
                                                    match: { status: "Published" }, // It means only the courses with the status "Published" will be populated.
                                                    populate: "ratingAndReviews", // This indicates that for each populated course document, the field named ratingAndReviews will be further populated with documents.
                                                    populate: {
                                                        path: "instructor"
                                                    }
                                                })
                                                .exec()

        console.log("selectedCategory ", selectedCategory);

        // Handle the case when category is not found
        if(!selectedCategory) {
            console.log("Category not found.");
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        // Handle the case when there are no courses
        if(selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.");
            return res.status(404).json({
				success: false,
				message: "No courses found for the selected category."
			});
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId }, // $ne selects the documents where the value of the field(here _id) is not equal to the specified value(here categoryId).
		});

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        )
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor"
                }
            })
            .exec()

        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor"
                }
            })
            .exec()
        
        // let allCourses = [];
        // for (const category of allCategories) {
        //     allCourses.push(...category.courses);
        // }
        // ----- (OR) -----
		const allCourses = allCategories.flatMap((category) => category.courses); // flatMap() is used to flatten the array of arrays into a single array of courses.

		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses
            }
		});
    }
    catch (error) {
        return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
};

// // *** This(Below) function smjelu che ***
// // categoryPageDetails Handler Function
// exports.categoryPageDetails = async (req, res) => {
//     try {
//         // Extract category id from req ki body
//         // Get courses for the specified category
//         // Handle the case when category is not found
//         // Handle the case when there are no courses
//         // Get courses for other categories
// 		// Get top-selling courses across all categories

//         // Extract category id from req ki body
//         const {categoryId} = req.body;

//         // Get courses for the specified category
//         const selectedCategory = await Category.findById(categoryId)
//                                                 .populate({
//                                                     path: "courses",
//                                                     match: { status: "Published" }, // It means only the courses with the status "Published" will be populated.
//                                                     populate: "ratingAndReviews" // This indicates that for each populated course document, the field named ratingAndReviews will be further populated with documents.
//                                                 })
//                                                 .exec()

//         console.log("selectedCategory ", selectedCategory);

//         // Handle the case when category is not found
//         if(!selectedCategory) {
//             console.log("Category not found.");
//             return res.status(404).json({
//                 success: false,
//                 message: "Category not found."
//             });
//         }

//         // Handle the case when there are no courses
//         if(selectedCategory.courses.length === 0) {
//             console.log("No courses found for the selected category.");
//             return res.status(404).json({
// 				success: false,
// 				message: "No courses found for the selected category."
// 			});
//         }

//         // const selectedCourses = selectedCategory.courses;

//         // Get courses for other categories
//         const categoriesExceptSelected = await Category.find({
// 			_id: { $ne: categoryId }, // $ne selects the documents where the value of the field(here _id) is not equal to the specified value(here categoryId).
// 		});

// 		let differentCourses = [];

// 		for (const category of categoriesExceptSelected) { // It iterates over categoriesExceptSelected and pushes all courses from each category into the differentCourses array.
// 			differentCourses.push(...category.courses); // Here, category.courses likely returns an array of courses associated with each category. By using the spread operator ..., the code is essentially extracting each individual course from the category.courses array and pushing them individually into the differentCourses array.
// 		}

// 		// Get top-selling courses across all categories
// 		const allCategories = await Category.find().populate("courses"); // It queries all categories to get all courses.
        
//         // let allCourses = [];
//         // for (const category of allCategories) {
//         //     allCourses.push(...category.courses);
//         // }
//         // ----- (OR) -----
// 		const allCourses = allCategories.flatMap((category) => category.courses); // flatMap() is used to flatten the array of arrays into a single array of courses.

// 		const mostSellingCourses = allCourses
// 			.sort((a, b) => b.sold - a.sold)
// 			.slice(0, 10);

// 		res.status(200).json({
//             success: true,
//             data: {
//                 selectedCourses: selectedCourses,
//                 differentCourses: differentCourses,
//                 mostSellingCourses: mostSellingCourses
//             }
// 		});
//     }
//     catch (error) {
//         return res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
//     }
// };