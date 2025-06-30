import {
  CheckIcon,
  PhotoIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline"

const features = [
  {
    title: "Manual Import",
    desc: "Organize your chaos. Easily tag and add your saved gems to Freebeez.",
    icon: CheckIcon,
    gradient: "from-green-400 to-emerald-500",
    ring: "ring-green-400/30",
  },
  {
    title: "Screenshot OCR",
    desc: "Drop a screenshot. Let AI extract what matters — text, links, content.",
    icon: PhotoIcon,
    gradient: "from-blue-400 to-cyan-500",
    ring: "ring-cyan-400/30",
  },
  {
    title: "DM Parser",
    desc: "Paste a DM. We’ll auto-detect, summarize, and store your resources.",
    icon: CpuChipIcon,
    gradient: "from-purple-400 to-pink-500",
    ring: "ring-pink-400/30",
  },
]

const FeatureHighlights = () => {
  return (
    <section className="relative py-12  px-6 bg-gradient-to-br from-white via-slate-50 to-blue-50">
      {/* Glows */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-blob delay-1000" />

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl h-24  font-extrabold text-center text-transparent bg-clip-text mb-16 bg-black">
          Why Freebeez?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group bg-white/60 rounded-3xl p-8 border border-gray-100 hover:shadow-2xl backdrop-blur-md transition duration-300 hover:-translate-y-1 ring-1 ${f.ring}`}
            >
              <div
                className={`w-14 h-14 mb-6 bg-gradient-to-r ${f.gradient} rounded-xl flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}
              >
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureHighlights
