import React, { useEffect, useState } from 'react';
import { FaArrowRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from "../components/core/HomePage/Button";
import Banner from "../assets/Images/banner.mp4";
import CodeBlocks from '../components/core/HomePage/CodeBlocks';
import TimelineSection from '../components/core/HomePage/TimelineSection';
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection';
import InstructorSection from '../components/core/HomePage/InstructorSection';
import Footer from '../components/common/Footer';
import ExploreMore from '../components/core/HomePage/ExploreMore';
import ReviewSlider from '../components/common/ReviewSlider';

// background random images
import backgroundImg1 from '../assets/Images/random bg img/coding bg1.jpg'
import backgroundImg2 from '../assets/Images/random bg img/coding bg2.jpg'
import backgroundImg3 from '../assets/Images/random bg img/coding bg3.jpg'
import backgroundImg4 from '../assets/Images/random bg img/coding bg4.jpg'
import backgroundImg5 from '../assets/Images/random bg img/coding bg5.jpg'
import backgroundImg6 from '../assets/Images/random bg img/coding bg6.jpeg'
import backgroundImg7 from '../assets/Images/random bg img/coding bg7.jpg'
import backgroundImg8 from '../assets/Images/random bg img/coding bg8.jpeg'
import backgroundImg9 from '../assets/Images/random bg img/coding bg9.jpg'
import backgroundImg10 from '../assets/Images/random bg img/coding bg10.jpg'
import backgroundImg111 from '../assets/Images/random bg img/coding bg11.jpg'
import { MdOutlineRateReview } from 'react-icons/md';


const randomImges = [
    backgroundImg1,
    backgroundImg2,
    backgroundImg3,
    backgroundImg4,
    backgroundImg5,
    backgroundImg6,
    backgroundImg7,
    backgroundImg8,
    backgroundImg9,
    backgroundImg10,
    backgroundImg111,
];

const Home = () => {

  // get background random images
  const [backgroundImg, setBackgroundImg] = useState(null);

  useEffect(() => {
      const bg = randomImges[Math.floor(Math.random() * randomImges.length)]
      setBackgroundImg(bg);
  }, [])

  return (
    <div>
        {/* background random image */}
        <div>
          <div className="w-full h-[660px] absolute top-[3rem] left-0 opacity-[0.3] overflow-hidden object-cover ">
            <img src={backgroundImg} alt="Background" className="w-full h-full object-cover" />
            <div className="absolute left-0 bottom-0 w-full h-[250px] opacity_layer_bg "></div>
          </div>
        </div>
      {/* section 1 */}
      <div className=' relative mx-auto flex flex-col w-11/12 items-center max-w-maxContent text-white justify-between'>
        <Link to={"/signup"}>
            <div className='group mt-[7rem] md:mt-[10rem] lg:mt-[15rem] p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit shadow-md shadow-blue-500'>
                <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900'>
                    <p>Become an Instructor</p>
                    <FaArrowRight />
                </div>
            </div>
        </Link>

        <div className=' text-center text-4xl font-semibold mt-7'>
            Empower Your Future with
            <HighlightText text={"Coding Skills"} />
        </div>

        <div className='mt-4 w-[90%] text-center text-lg font-bold text-richblack-300'>
          With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on projects, quizzes, and personalized feedback from instructors. 
        </div>

        <div className=' flex flex-row gap-7 mt-8'>
          <CTAButton active={true} linkto={"/signup"}>
            Learn More
          </CTAButton>

          <CTAButton active={false} linkto={"/login"}>
            Book a Demo
          </CTAButton>
        </div>

        {/* <div className=' mx-3 my-12 shadow-[10px_-5px_50px_-5px] shadow-blue-200'>
          <video
            // className='shadow-[20px_20px_rgba(255,255,255)]'
            muted
            loop
            autoPlay
          >
            <source src={Banner} type='video/mp4' />
          </video>
        </div> */}

        {/* Code Section 1 */}
        <div className='mt-[5rem] md:mt-[10rem] lg:mt-[12rem]'>
          <CodeBlocks 
            position = {"lg:flex-row"}
            heading = {
              <div className='text-4xl font-semibold'>
                Unlock Your
                <HighlightText text={"coding potential "}/>
                with our online courses.
              </div>
            }
            subheading = {
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={
              {
                  btnText: "Try it Yourself",
                  linkto: "/signup",
                  active: true
              }
            }
            ctabtn2={
                {
                    btnText: "Learn More",
                    linkto: "/signup",
                    active: false
                }
            }

            codeblock={`<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            codeColor={"text-yellow-25"}
            // backgroudGradient={<div className="codeblock1 absolute"></div>}
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlocks 
            position = {"lg:flex-row-reverse"}
            heading = {
              <div className='w-[100%] text-4xl font-semibold lg:w-[50%]'>
                Start
                <HighlightText text={"coding in seconds"}/>
              </div>
            }
            subheading = {
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={
              {
                  btnText: "Continue Lesson",
                  linkto: "/signup",
                  active: true
              }
            }
            ctabtn2={
                {
                    btnText: "Learn More",
                    linkto: "/signup",
                    active: false
                }
            }

            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            codeColor={"text-white"}
            // backgroudGradient={<div className="codeblock2 absolute"></div>}
          />
        </div>

        <ExploreMore />
      </div>

      {/* section 2 */}
      <div className=' bg-pure-greys-5 text-richblack-700'>
        <div className='homepage_bg h-[310px]'>
          <div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>
            <div className='h-[150px]'></div>
            <div className='flex flex-row gap-7 text-white'>
              <CTAButton active = {true} linkto = {"/signup"} >
                <div className='flex items-center gap-3'>
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>

              <CTAButton active = {false} linkto = {"/signup"}>
                <div>
                  Lear More
                </div>
              </CTAButton>
            </div>
          </div>
        </div>

        <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>
          <div className='flex flex-col lg:flex-row justify-between gap-5 mb-10 mt-[95px] lg:gap-0'>
            <div className='text-4xl font-semibold lg:w-[45%]'>
              Get the Skills you need for a
              <HighlightText text={"Job that is in demand"} />
            </div>
            
            <div className='flex flex-col gap-10 lg:w-[40%] items-start'>
              <div className='text-[16px]'>
                The modern StudyNotion is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
              </div>
              <CTAButton active = {true} linkto = {"/signup"}>
                <div>
                  Learn more
                </div>
              </CTAButton>
            </div>
          </div>

          <TimelineSection />

          <LearningLanguageSection />

        </div>

      </div>

      {/* section 3 */}
      <div className='mt-14 w-11/12 mx-auto max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white'>
        <InstructorSection />

        <h1 className='text-center text-4xl font-semibold flex justify-center items-center gap-x-3 mt-8'>
          Reviews from other learners <MdOutlineRateReview className='hidden md:block text-yellow-25' />
        </h1>
        <ReviewSlider />
      </div>
      
      {/* footer */}
      <Footer />

    </div>
  )
}

export default Home
