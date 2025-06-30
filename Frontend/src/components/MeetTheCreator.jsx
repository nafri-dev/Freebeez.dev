import { FaGithub, FaLinkedin } from "react-icons/fa";

const MeetTheCreator = () => {
  return (
    <section className="relative py-28 px-6 lg:px-20 bg-white overflow-hidden">
      {/* Gradient Blurs */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-yellow-400 via-yellow-200 to-yellow-100 xl:bg-gradient-to-tr xl:from-yellow-400 xl:via-yellow-400 xl:to-yellow-100 opacity-30 blur-3xl rounded-full z-0" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-500 xl:bg-gradient-to-tr xl:from-yellow-400 xl:via-yellow-400 xl:to-yellow-100 opacity-20 blur-2xl rounded-full z-0" />

      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-20">
        {/* Left: Image */}
        <div className="flex justify-center md:justify-end">
          <div className="rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.1)] w-64 h-76 md:w-80 md:h-96">
            <img
              src="founder.png"
              alt="Mohamed Irfan"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Text Content */}
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Meet the Creator
          </h2>

          <blockquote className="text-lg sm:text-xl text-gray-700 font-medium italic border-l-4 border-blue-600 pl-6 mb-6 leading-relaxed">
            “I commented on over 50 giveaways. I didn’t open even 10. I knew I wasn’t alone — so I built Freebeez.”
          </blockquote>

          <div className="mb-2">
            <p className="text-xl font-semibold text-gray-800">Mohamed Irfan</p>
            <p className="text-sm text-gray-500">React & MERN Developer · Builder of Ideas</p>
          </div>

          <div className="flex gap-5 mt-6">
            <a
              href="https://github.com/nafri-dev/instavault"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black transition"
            >
              <FaGithub className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com/in/mohamedirfandev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <FaLinkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheCreator;
