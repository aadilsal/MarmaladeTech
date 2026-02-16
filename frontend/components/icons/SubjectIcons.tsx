import React from "react"

interface IconProps {
  className?: string
}

export function BiologyIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C10.3431 2 9 3.34315 9 5C9 6.30622 9.83481 7.41746 11 7.82929V11C11 11.5523 11.4477 12 12 12C12.5523 12 13 11.5523 13 11V7.82929C14.1652 7.41746 15 6.30622 15 5C15 3.34315 13.6569 2 12 2Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M12 12C11.4477 12 11 12.4477 11 13V16.1707C9.83481 16.5825 9 17.6938 9 19C9 20.6569 10.3431 22 12 22C13.6569 22 15 20.6569 15 19C15 17.6938 14.1652 16.5825 13 16.1707V13C13 12.4477 12.5523 12 12 12Z"
        fill="currentColor"
      />
      <path
        d="M7.5 10C6.11929 10 5 11.1193 5 12.5C5 13.8807 6.11929 15 7.5 15C8.88071 15 10 13.8807 10 12.5C10 11.1193 8.88071 10 7.5 10Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M16.5 10C15.1193 10 14 11.1193 14 12.5C14 13.8807 15.1193 15 16.5 15C17.8807 15 19 13.8807 19 12.5C19 11.1193 17.8807 10 16.5 10Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  )
}

export function ChemistryIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V9.58579L18.7071 14.2929C19.4692 15.0549 20 16.1062 20 17.5858C20 20.0162 18.0162 22 15.5858 22H8.41421C5.98376 22 4 20.0162 4 17.5858C4 16.1062 4.53081 15.0549 5.29289 14.2929L10 9.58579V3Z"
        fill="currentColor"
      />
      <circle cx="9" cy="17" r="1.5" fill="white" opacity="0.4" />
      <circle cx="12.5" cy="18" r="1" fill="white" opacity="0.6" />
      <circle cx="15" cy="16" r="1.2" fill="white" opacity="0.5" />
    </svg>
  )
}

export function PhysicsIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path
        d="M12 5C12.5523 5 13 4.55228 13 4V3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V4C11 4.55228 11.4477 5 12 5Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M12 22C11.4477 22 11 21.5523 11 21V20C11 19.4477 11.4477 19 12 19C12.5523 19 13 19.4477 13 20V21C13 21.5523 12.5523 22 12 22Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M20 13C20.5523 13 21 12.5523 21 12C21 11.4477 20.5523 11 20 11H19C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13H20Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M6 12C6 12.5523 5.55228 13 5 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H5C5.55228 11 6 11.4477 6 12Z"
        fill="currentColor"
        opacity="0.4"
      />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    </svg>
  )
}

export function EnglishIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M8 8H16M8 12H16M8 16H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LogicIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" />
      <path
        d="M10.5 6.5L13.5 6.5M6.5 10.5L6.5 13.5M17.5 10.5L17.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}

// Generic quiz icon
export function QuizIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 11H15M9 15H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

// Trophy icon for achievements
export function TrophyIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9C6 10.6569 7.34315 12 9 12C9.55228 12 10 11.5523 10 11V6C10 5.44772 9.55228 5 9 5H6V9Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M18 9C18 10.6569 16.6569 12 15 12C14.4477 12 14 11.5523 14 11V6C14 5.44772 14.4477 5 15 5H18V9Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M9 16H15V18C15 19.1046 14.1046 20 13 20H11C9.89543 20 9 19.1046 9 18V16Z"
        fill="currentColor"
      />
      <path
        d="M8 5H16V12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12V5Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  )
}

// Streak/Fire icon
export function StreakIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C12 2 17 7 17 12C17 15.3137 14.3137 18 11 18C7.68629 18 5 15.3137 5 12C5 9 8 5 12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 7C12 7 14.5 9.5 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.5 11 8.5 12 7Z"
        fill="white"
        opacity="0.4"
      />
    </svg>
  )
}

// Target/Accuracy icon
export function TargetIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
}
