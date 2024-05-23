const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId)
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}

// Below code is for purchasing one course at a time. And above code is for purchasing many course at a time.

// // Capture the payment and initiate the Razorpay order
// // capturePayment
// exports.capturePayment = async (req, res) => {
//     // Extract course_id and userId from req ki body
//     // Get user id from req.user
//     // course_id validation
//     // course validation
//         // Check User already bought this course(User already pay for this course)
//     // Create order
//     // Initiate the payment using razorpay
//     // Return response

//     // Extract course_id and userId from req ki body
//     const {course_id} = req.body;
//     // Get user id from req.user // In auth middleware we add user data in request, req.user = decode; // So that's why we use this req.user.id
//     const userId = req.user.id; // (OR) const {id} = req.user; // here userId is user ki simple id(Here userId is in String).

//     // course_id validation
//     if(!course_id) {
//         return res.json({
//             success: false,
//             message: "Please provide valid course id."
//         });
//     }

//     // course validation
//     let course;
//     try {
//         course = await Course.findById(course_id);
//         if(!course) {
//             return res.json({
//                 success: false,
//                 message: "Could not find the course."
//             });
//         }

//         // Check User already bought this course(User already pay for this course)
//         // Convert 'userId' from String to ObjectId Because here userId is in String
//         const uid = new mongoose.Types.ObjectId(userId);
//         // If we want to proform course.studentsEnrolled.includes(uid) then id must be in ObjectId type Because course.studentsEnrolled is an array of ObjectIds
//         if(course.studentsEnrolled.includes(uid)) {
//             return res.status(200).json({
//                 success: false,
//                 message: "Student(User) is already enrolled."
//             });
//         }
//     }
//     catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: error.messages
//         });
//     }

//     // Create order
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount * 100,
//         currency,
//         receipt: Math.random(Date.now()).toString(), // Creating a unique receipt number based on the current time.
//         notes: {
//             courseId: course_id,
//             userId
//         }
//     };

//     try {
//         // Initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log("paymentResponse ", paymentResponse);

//         // Return response
//         return res.status(200).json({
//             success: true,
//             courseName: course.courseName,
//             courseDescription: course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId: paymentResponse.id,
//             currency: paymentResponse.currency,
//             amount: paymentResponse.amount
//         });
//     }
//     catch (error) {
//         console.log(error);
//         res.json({
//             success: false,
//             message: "Could not initiate order."
//         });
//     }
// }

// // Verify signature of razorpay and server
// exports.verifySignature = async (req, res) => {
//     // Fulfill the action            
//         // Find the Course and enroll the userId in Course schema
//         // Validation
//         // Find the User and add courseId in User schema
//         // Send mail of successfully bought course
//         // Return response

//     const webhookSecret = "12345678"; // server ka secret // the secret key used by the server to sign webhook requests.
    
//     const signature = req.headers["x-razorpay-signature"]; // razorpay ka secret(ye secret razorpay ne send kra he) // This line retrieves the signature from the request headers. Razorpay sends this signature as part of the webhook request in the x-razorpay-signature header. It's used to verify the authenticity of the request.
    
//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest) {
//         console.log("Payment is Authorised.");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try {
//             // Fulfill the action
            
//             // Find the Course and enroll the userId in Course schema
//             const enrolledCourse = await Course.findOneAndUpdate(
//                                                 {_id: courseId},
//                                                 {
//                                                     $push: {
//                                                         studentsEnrolled: userId
//                                                     }
//                                                 },
//                                                 {new: true}
//             );

//             // Validation
//             if(!enrolledCourse) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Course not found."
//                 });
//             }

//             console.log("enrolledCourse ", enrolledCourse);

//             // Find the User and add courseId in User schema
//             const enrolledStudent = await User.findOneAndUpdate(
//                                                 {_id: userId},
//                                                 {
//                                                     $push: {
//                                                         courses: courseId
//                                                     }
//                                                 },
//                                                 {new: true}
//             );

//             console.log("enrolledStudent ", enrolledStudent);

//             // Send mail of successfully bought course
//             const emailResponse = await mailSender(
//                 enrolledStudent.email,
//                 "Congratulations from CodeHelp",
//                 "Congratulations, you are onboarded into new CodeHelp Course",
//             );

//             console.log("emailResponse ", emailResponse);
            
//             // Return response
//             return res.status(200).json({
//                 success: true,
//                 message: "Signature Verified and Course Added."
//             });

//         }
//         catch(error) {
//             console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 message: error.message
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid request.'
//         });
//     }
// }