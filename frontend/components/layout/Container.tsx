import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface ContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl'
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
}

export function Container({ 
  children, 
  maxWidth = '6xl',
  className = '',
  ...props 
}: ContainerProps) {
  return (
    <motion.div
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
