import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  InboxIcon,
  DocumentMagnifyingGlassIcon,
  ArchiveBoxXMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

const ProblemSection = () => {
  return (
    <section className="py-28 px-6 bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background Blur Effects */}
      <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-r from-blue-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-1000"></div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        {/* Section Heading */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-800 text-sm font-semibold rounded-full shadow">
            <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2" />
            Every Creator's Story
          </div>
          <h2 className="text-5xl font-extrabold mt-6 mb-4 text-gray-900 leading-tight">
            The Digital Chaos We All Know
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Most creators don't realize they're silently drowning in an ocean of disorganized resources.
          </p>
        </div>

        {/* Journey Timeline */}
        <div className="relative border-l-2 border-dashed border-gray-300 pl-6 space-y-24 w-full max-w-3xl">
          {[{
              title: "They Start Saving Everything",
              icon: InboxIcon,
              color: "from-blue-500 to-cyan-500",
              description:
                "87% of creators hoard freebies and resources: tools, templates, eBooks, icons — anything that sparks inspiration."
            },
            {
              title: "Then Comes the Frustration",
              icon: ClockIcon,
              color: "from-orange-500 to-red-500",
              description:
                "Hours are lost every week trying to retrieve what was once saved. The search ends in frustration more often than success."
            },
            {
              title: "And Most of It? Forgotten",
              icon: ArchiveBoxXMarkIcon,
              color: "from-purple-500 to-pink-500",
              description:
                "Over 73% of those resources never see the light of day again. Out of sight, out of mind."
            },
          ].map((step, i) => (
            <div key={i} className="relative">
              <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center text-white absolute -left-8 top-0 shadow-lg`}>
                <step.icon className="w-8 h-8" />
              </div>
              <div className="ml-16">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.description}</p>
              </div>
            </div>
          ))}
        </div>




        {/* Solution Transition */}
        <div className="mt-32 text-center">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-full shadow-lg mb-6">
            That's Why We Built Freebeez
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Your Digital Memory
          </h3>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            No more digging, no more forgetting. Freebeez brings clarity, structure, and supercharged search to every resource you collect.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[{
              icon: <CheckCircleIcon className="w-6 h-6" />, text: "Smart auto-categorization", gradient: "from-green-500 to-emerald-500"
            },
            {
              icon: <CheckCircleIcon className="w-6 h-6" />, text: "Powerful multi-tag search", gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: <CheckCircleIcon className="w-6 h-6" />, text: "Timely resource reminders", gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: <CheckCircleIcon className="w-6 h-6" />, text: "Seamless access anywhere", gradient: "from-orange-500 to-red-500"
            },
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/60 rounded-xl backdrop-blur-md border border-gray-100">
              <div className={`w-10 h-10 bg-gradient-to-r ${benefit.gradient} rounded-xl flex items-center justify-center text-white shadow`}>
                {benefit.icon}
              </div>
              <span className="text-gray-700 font-medium text-lg">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
