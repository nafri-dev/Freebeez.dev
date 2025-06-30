"use client";

import {
  ShareIcon,
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

import { FaGithub, FaLinkedin } from "react-icons/fa";

const SupportSection = ({ shareOnLinkedIn, starOnGitHub }) => {
  return (
    <section className="relative py-32 px-6 bg-white overflow-hidden">
      {/* Blurred Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 opacity-30 blur-3xl rounded-full -top-40 -left-32"></div>
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-2xl rounded-full -bottom-24 right-0"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center">
        {/* Hero Title */}
        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Let the World Know 🚀
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-16">
          Loved how Freebeez cleaned up your resource mess? Your story might just help the next user get organized too.
        </p>

        {/* CTA Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 hover:shadow-xl transition">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Share Your Experience</h4>
            <p className="text-gray-600 text-sm">Post on LinkedIn how Freebeez helped you manage Instagram saves</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 hover:shadow-xl transition">
            <RocketLaunchIcon className="w-8 h-8 text-purple-500 mb-4 mx-auto" />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Spread the Word</h4>
            <p className="text-gray-600 text-sm">Let friends or community know there’s a smarter way to organize</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 hover:shadow-xl transition">
            <HandRaisedIcon className="w-8 h-8 text-indigo-500 mb-4 mx-auto" />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Support the Project</h4>
            <p className="text-gray-600 text-sm">Star the repo and drop a suggestion or feedback. It helps!</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-24">
          <button
            onClick={shareOnLinkedIn}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            <FaLinkedin className="w-5 h-5 mr-3" />
            Share on LinkedIn
            <ArrowRightIcon className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={starOnGitHub}
            className="group bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300 px-8 py-4 rounded-xl font-semibold flex items-center justify-center transition duration-200 shadow-xl hover:shadow-2xl"
          >
            <FaGithub className="w-5 h-5 mr-3 group-hover:text-black transition-colors" />
            Star on GitHub
            <ArrowRightIcon className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Statement */}
        <div className="text-center">
          <p className="text-base text-gray-500 mb-10 max-w-xl mx-auto">
            Every small share helps someone else organize better. Let’s declutter the web — one freebie at a time.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-4 h-4 text-red-500" />
              </div>
              <span>Made with love</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              </div>
              <span>Forever free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <GlobeAltIcon className="w-4 h-4 text-blue-500" />
              </div>
              <span>Open source</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
