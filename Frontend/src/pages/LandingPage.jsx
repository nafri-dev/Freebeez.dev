import { Link } from "react-router-dom"
import {
  SparklesIcon,
  BookOpenIcon,
  BellIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline"

const features = [
  {
    name: "Smart Organization",
    description:
      "Automatically categorize your freebies by type, topic, and source. Never lose track of valuable resources again.",
    icon: BookOpenIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    name: "Intelligent Reminders",
    description: "Set custom reminders via email. Get nudged to actually use what you've collected.",
    icon: BellIcon,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    name: "Progress Analytics",
    description: "Track your learning progress, completion rates, and discover your most valuable content categories.",
    icon: ChartBarIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    name: "AI-Powered Detection",
    description: "Paste your Instagram DMs and let AI automatically detect and extract freebies for you.",
    icon: BoltIcon,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    name: "Secure & Private",
    description: "Your data is encrypted and secure. We never access your Instagram account without permission.",
    icon: ShieldCheckIcon,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
]

const stats = [
  { name: "of downloaded freebies never get opened", value: "73%" },
  { name: "average time spent searching for lost resources", value: "2.5hrs" },
  { name: "estimated value of unused free resources per person", value: "$247" },
]

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">InstaVault</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            🔥 Your Personal Smart Vault
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Never Lose Another Instagram Freebie Again
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Automatically store, categorize, and get reminded about all the free ebooks, PDFs, templates, and courses
            you collect from Instagram. Turn your freebie chaos into organized productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Start Organizing Now
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <button className="btn-secondary text-lg px-8 py-3">Watch Demo</button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Everything You Need to Stay Organized</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From automatic categorization to smart reminders, InstaVault keeps your Instagram freebies organized and
            actionable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="card p-8 hover:shadow-lg transition-shadow group">
              <div
                className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.name}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">The Freebie Problem is Real</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <p className="text-purple-100">{stat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Trusted by Content Creators</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of Instagram users who have already organized their digital life with InstaVault.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">5K+</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
            <p className="text-gray-600">Content creators organizing their freebies</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">50K+</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Freebies Organized</h3>
            <p className="text-gray-600">Digital resources saved and categorized</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">98%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction Rate</h3>
            <p className="text-gray-600">Users love their organized digital life</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Transform Your Freebie Game?</h2>
            <p className="text-gray-600 mb-8">
              Join thousands of users who've already organized their Instagram freebies and boosted their productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Start Your Free Trial
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">InstaVault</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2024 InstaVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
