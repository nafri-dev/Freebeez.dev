import {
  ChatBubbleLeftEllipsisIcon,
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

const steps = [
  {
    icon: ChatBubbleLeftEllipsisIcon,
    title: "Step 1 — Comment on an Instagram Post",
    desc: "Just reply with a keyword and unlock your freebie in seconds.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: PaperAirplaneIcon,
    title: "Step 2 — Get the Freebie in DM",
    desc: "No waiting. The freebie flies straight to your inbox.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: ClipboardDocumentIcon,
    title: "Step 3 — Save It Effortlessly",
    desc: "Paste a DM, upload a screenshot, or just log it. Simple as that.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Squares2X2Icon,
    title: "Step 4 — It's on Your Dashboard",
    desc: "All your resources, auto-tagged, organized, and always ready.",
    gradient: "from-orange-500 to-red-500",
  },
]

const HowItWorks = () => {
  return (
    <section className="py-2 md:py-28 px-6 bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
          Built for Simplicity.
          <br />
          Works Like Magic.
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Here's the effortless 4-step flow to organize your digital chaos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-start gap-5 bg-white border border-gray-100 shadow-md rounded-2xl p-6 hover:shadow-xl transition group`}
          >
            <div
              className={`w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow group-hover:scale-105 transition`}
            >
              <step.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 mt-1 text-sm">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
