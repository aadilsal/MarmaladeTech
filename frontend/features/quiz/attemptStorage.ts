export type LocalAttempt = {
  quizId: number
  attemptId?: number
  startedAt: string
  submittedAt?: string
  currentIndex?: number
  answers: Record<number, number>
  score?: number
  totalQuestions?: number
  timeTakenSeconds?: number
}

const attemptKey = (quizId: number) => `quiz_attempt_${quizId}`
const resultKey = (attemptId: number) => `quiz_result_${attemptId}`

export function saveAttemptProgress(attempt: LocalAttempt) {
  try {
    localStorage.setItem(attemptKey(attempt.quizId), JSON.stringify(attempt))
  } catch {
    // ignore
  }
}

export function loadAttemptProgress(quizId: number): LocalAttempt | null {
  try {
    const raw = localStorage.getItem(attemptKey(quizId))
    if (!raw) return null
    return JSON.parse(raw) as LocalAttempt
  } catch {
    return null
  }
}

export function clearAttemptProgress(quizId: number) {
  try {
    localStorage.removeItem(attemptKey(quizId))
  } catch {
    // ignore
  }
}

export function saveAttemptResult(attemptId: number, data: LocalAttempt) {
  try {
    localStorage.setItem(resultKey(attemptId), JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function loadAttemptResult(attemptId: number): LocalAttempt | null {
  try {
    const raw = localStorage.getItem(resultKey(attemptId))
    if (!raw) return null
    return JSON.parse(raw) as LocalAttempt
  } catch {
    return null
  }
}

export function listSavedResults(): LocalAttempt[] {
  if (typeof window === "undefined") return []
  const results: LocalAttempt[] = []
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("quiz_result_")) {
        const raw = localStorage.getItem(key)
        if (raw) results.push(JSON.parse(raw) as LocalAttempt)
      }
    })
  } catch {
    return results
  }
  return results
}

export function listInProgressAttempts(): LocalAttempt[] {
  if (typeof window === "undefined") return []
  const results: LocalAttempt[] = []
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("quiz_attempt_")) {
        const raw = localStorage.getItem(key)
        if (raw) results.push(JSON.parse(raw) as LocalAttempt)
      }
    })
  } catch {
    return results
  }
  return results
}

export function clearAllLocalResults() {
  if (typeof window === "undefined") return
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("quiz_result_")) localStorage.removeItem(key)
      if (key.startsWith("quiz_attempt_")) localStorage.removeItem(key)
    })
  } catch {
    // ignore
  }
}
