"use client"

import { Link } from "react-router-dom"
import { ShareIcon, StarIcon, SparklesIcon, ArrowRightIcon, PlayIcon , XMarkIcon } from "@heroicons/react/24/outline"
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa"
import { useState } from "react"

const HeroSection = ({ shareOnLinkedIn, starOnGitHub }) => {
   const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Blur Effects - Hidden on mobile to reduce clutter */}
      <div className="hidden md:block">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Mobile Background Effects - Smaller and positioned better */}
      <div className="md:hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-15"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-15"></div>
      </div>

  

      {/* Instagram Logo - Left Side - Only on large screens */}
      <div className="absolute left-20 top-1/2 transform rotate-12 -translate-y-1/2 hidden xl:block">
        <div className="w-48 h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
          <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      </div>


      {/* Mobile Phone Mockup - Right Side - Only on large screens */}
      <div className="absolute right-20 top-1/2 transform -translate-y-1/2 hidden xl:block">
        <div className="relative">
          <div className="w-52 h-[400px] 2xl:w-64 2xl:h-[480px] bg-gray-900 rounded-[2.5rem] border-[8px] border-gray-800 shadow-[0_15px_60px_rgba(0,0,0,0.4)]">
            <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
              {/* Status Bar */}
              <div className="flex justify-between items-center text-white text-[10px] px-4 py-2">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-4 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-4 h-1.5 bg-white rounded-sm"></div>
                </div>
              </div>

              {/* Instagram Header */}
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-800">
                <h1 className="text-white text-lg font-semibold">Instagram</h1>
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
              </div>

              {/* Instagram Post */}
              <div className="p-4">
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                    <span className="text-white text-sm font-medium">freebie_creator</span>
                  </div>
                  <div className="bg-gray-700 h-24 rounded-lg flex items-center justify-center text-blue-400 text-xs font-semibold mb-2">
                    🎁 FREE UI KIT
                  </div>
                  <p className="text-gray-300 text-xs">
                    Comment <span className="text-white font-semibold">"SEND ME"</span> for free resources! 🔥
                  </p>
                </div>

                {/* Comments */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-2"></div>
                    <span className="text-white text-xs">you: SEND ME! 🔥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto text-center z-10 ">
        {/* Badge */}
        <div className="hidden sm:inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg">
          <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500" />
          Your Personal Smart Vault - Now with AI
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
          <span className="font-mono bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
            Never Lose Another
          </span>
          <br />
          <span className="font-mono bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Instagram Freebie
          </span>
        </h1>

        {/* Mobile Badge */}
        <div className="inline-flex sm:hidden items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 text-xs font-semibold mb-6 shadow-lg">
          <SparklesIcon className="w-3 h-3 mr-2 text-blue-500" />
           Your Personal Smart Vault - Now with AI
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
          Transform your freebie chaos into organized productivity with AI-powered detection, smart categorization, and
          intelligent reminders that actually work.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-4 sm:mb-6 px-2">
          <Link
            to="/register"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            🚀 Start Tracking Now
            <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
             onClick={() => setShowVideo(true)}
          className="group bg-white/90 backdrop-blur-md text-gray-700 px-8 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg">
            <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:scale-110 transition-transform" />
            Watch Demo
          </button>

           {showVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-red-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Video Player */}
            <video controls autoPlay className="w-full h-auto ">
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
        </div>

        {/* Social Icons */}
{/* Redesigned Social Icons */}
<div className="flex items-center justify-center gap-6 mt-10">
  {/* LinkedIn */}
  <button
    onClick={shareOnLinkedIn}
    className="flex items-center gap-2 bg-white text-blue-600 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
  >
    <FaLinkedin className="w-5 h-5" />
    <span className="text-sm font-medium">Share it</span>
  </button>

  {/* GitHub */}
  <button
    onClick={starOnGitHub}
    className="flex items-center gap-2 bg-white text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
  >
    <FaGithub className="w-5 h-5" />
    <span className="text-sm font-medium">Star it</span>
  </button>
</div>



      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

export default HeroSection
