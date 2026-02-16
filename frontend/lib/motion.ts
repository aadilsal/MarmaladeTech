import { motion } from 'framer-motion'

// Small typing workaround for motion elements when className typing conflicts occur.
export const MotionDiv: any = (motion as any).div
export const MotionElement: any = motion as any
