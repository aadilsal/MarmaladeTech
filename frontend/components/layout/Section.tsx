import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionProps extends HTMLMotionProps<'section'> {
  children: ReactNode
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

const spacingClasses = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-24',
}

export function Section({ 
  children, 
  spacing = 'lg',
  className = '',
  ...props 
}: SectionProps) {
  return (
    <motion.section
      className={`${spacingClasses[spacing]} ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.section>
  )
}
