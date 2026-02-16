import { motion } from 'framer-motion'
import { MotionDiv } from '../lib/motion'

const features = [
  {title: 'Curated Quizzes', desc: 'High-quality quizzes across all MDCAT topics with detailed explanations and images.'},
  {title: 'AI Explanations', desc: 'Get concise AI-generated explanations that help you understand the ‘why’ behind each answer.'},
  {title: 'Progress Tracking', desc: 'Personalized stats and leaderboard to motivate and measure improvement.'},
  {title: 'Mobile Ready', desc: 'Practice on the go with a fully responsive and fast interface.'},
]

export default function Features(){
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}}>
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Everything you need to succeed</h2>
        </motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}}>
          <p className="text-center text-slate-600 mb-10">A complete exam prep platform packed with features that support active learning and long-term retention.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <MotionDiv key={i} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay:0.1*i}} className="p-6 border rounded-lg shadow-sm hover:shadow-lg transition bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  )
}
