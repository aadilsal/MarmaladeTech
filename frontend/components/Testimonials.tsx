import { motion } from 'framer-motion'
import { MotionDiv } from '../lib/motion'

const testimonials = [
  {name: 'Ayesha', role: 'MDCAT Topper', quote: 'The AI explanations clarified concepts I was struggling with — my scores improved fast.'},
  {name: 'Bilal', role: 'Student', quote: 'Great quizzes and nice UX. The leaderboard motivated me to study consistently.'},
]

export default function Testimonials(){
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <MotionDiv initial={{opacity:0, y:8}} animate={{opacity:1, y:0}}>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">What our students say</h2>
        </MotionDiv>

        <div className="space-y-6">
          {testimonials.map((t, i) => (
            <MotionDiv initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.12*i}} key={i} className="bg-white p-6 rounded-lg shadow">
              <blockquote>
                <p className="text-slate-700 italic">“{t.quote}”</p>
                <footer className="mt-3 text-sm text-slate-500">— {t.name}, {t.role}</footer>
              </blockquote>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  )
}
