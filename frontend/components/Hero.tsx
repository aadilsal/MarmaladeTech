import { motion } from 'framer-motion'
import Link from 'next/link'
import { MotionDiv } from '../lib/motion'

export default function Hero(){
  return (
    <section className="bg-gradient-to-b from-sky-600 to-indigo-700 text-white">
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">Master the MDCAT — Smarter. Faster. Together.</h1>
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.25}}>
            <p className="text-lg lg:text-xl text-sky-100 mb-8">Practice high-quality quizzes, track your progress, and get AI-powered explanations to improve understanding — built for students and educators.</p>
          </motion.div>

          <MotionDiv initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/quizzes" className="inline-block bg-white text-sky-700 font-semibold px-6 py-3 rounded-md shadow hover:shadow-lg transition">Start Practicing</Link>
            <Link href="/register" className="inline-block border border-white/30 text-white px-6 py-3 rounded-md hover:bg-white/10 transition">Join for Free</Link>
          </MotionDiv>

          <MotionDiv initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} className="mt-10 flex items-center justify-center gap-8 text-sm text-sky-100">
            <div className="text-center">
              <div className="text-2xl font-bold">10k+</div>
              <div>Practice Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div>Students Improved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">AI</div>
              <div>Smart Explanations</div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  )
}
