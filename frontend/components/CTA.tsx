import Link from 'next/link'
import { motion } from 'framer-motion'
import { MotionDiv } from '../lib/motion'

export default function CTA(){
  return (
    <section className="py-12 bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}}>
          <h3 className="text-2xl font-bold mb-3">Ready to boost your MDCAT score?</h3>
        </motion.div>
        <MotionDiv initial={{opacity:0}} animate={{opacity:1}} className="mb-6">
          <p className="text-sky-100">Join thousands of learners and get smart explanations and progress tracking — free to start.</p>
        </MotionDiv>
        <MotionDiv initial={{opacity:0}} animate={{opacity:1}}>
          <Link href="/register" className="inline-block bg-white text-sky-700 font-semibold px-6 py-3 rounded-md shadow hover:shadow-lg transition">Create Free Account</Link>
        </MotionDiv>
      </div>
    </section>
  )
}
