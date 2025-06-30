"use client"

import { useState } from "react"
import { Bars3Icon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { Link } from "react-router-dom"

// Import all section components


import HeroSection from "../components/HeroSection"
// import FeatureHighlights from "../components/FeatureHighlights"
import HowItWorks from "../components/HowItWorks"
import ProblemSection from "../components/ProblemSection"
import SupportSection from "../components/SupportSection"
import MeetTheCreator from "../components/MeetTheCreator"

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const shareOnLinkedIn = () => {
    window.open("https://www.linkedin.com/posts/mohamedirfandev_launch-freebeez-reactjs-activity-7345458165871726594-kZVo?utm_source=share&utm_medium=member_desktop&rcm=ACoAADvd88MB-7WJa7vXt8jbIi4QHb6BOK06Nac", "_blank")
  }

  const starOnGitHub = () => {
    window.open("https://github.com/nafri-dev/Freebeez.dev", "_blank")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 to-red-200s bg-clip-text text-transparent">
              Freebeez
            </span>
             <span className="text-sm font-light bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent mt-2">
              for instagram
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-all duration-200">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden focus:outline-none">
            {menuOpen ? (
              <XMarkIcon className="w-7 h-7 text-gray-700" />
            ) : (
              <Bars3Icon className="w-7 h-7 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="sm:hidden p-4 pb-4 flex flex-col gap-3 bg-white/95 backdrop-blur-md border-t border-gray-200">
            <Link
              to="/login"
              className="text-gray-600 hover:text-blue-600 font-medium text-center py-2 transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg"
              onClick={() => setMenuOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        )}
      </header>

      {/* All Sections */}
      <HeroSection shareOnLinkedIn={shareOnLinkedIn} starOnGitHub={starOnGitHub} />
      {/* <FeatureHighlights /> */}
      
      <HowItWorks />
      <ProblemSection />
      <MeetTheCreator />
      <SupportSection shareOnLinkedIn={shareOnLinkedIn} starOnGitHub={starOnGitHub} />

      {/* Footer */}
      
    <footer className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-8 text-white">
          
          <div className="text-center mt-4  ">
            <span className="text-sm  tracking-wide">
            © 2025 Freebeez | All Rights Reserved
            </span>
          </div>

          
  
      
    </footer>


    </div>
  )
}

export default LandingPage
