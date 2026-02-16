/**
 * Error Handling Utilities
 * Provides centralized error handling for HTTP status codes
 */

export interface ApiError {
  status?: number
  message: string
  details?: string
}

/**
 * Parse API error and return user-friendly message
 */
export function parseApiError(error: any): ApiError {
  // Check for axios error response
  if (error?.response?.data?.detail) {
    return {
      status: error.response.status,
      message: error.response.data.detail,
      details: error.response.data.details,
    }
  }

  // Check for generic axios error
  if (error?.response?.status) {
    const status = error.response.status
    const message = getStatusMessage(status)
    return {
      status,
      message,
      details: error.message,
    }
  }

  // Network error
  if (error?.message === 'Network Error') {
    return {
      message: 'Network error. Please check your connection.',
      details: 'Unable to reach the server',
    }
  }

  // Generic error
  return {
    message: error?.message || 'An error occurred',
    details: 'Please try again',
  }
}

/**
 * Get user-friendly message for HTTP status codes
 */
export function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.'
    case 401:
      return 'Please log in to continue.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'Resource not found.'
    case 429:
      return 'Too many requests. Please try again later.'
    case 500:
      return 'Server error. Please try again later.'
    case 502:
    case 503:
    case 504:
      return 'Server is temporarily unavailable. Please try again later.'
    default:
      return 'An error occurred. Please try again.'
  }
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: any): boolean {
  return error?.response?.status === 401
}

/**
 * Check if error is permission related
 */
export function isPermissionError(error: any): boolean {
  return error?.response?.status === 403
}

/**
 * Check if error is rate limit related
 */
export function isRateLimitError(error: any): boolean {
  return error?.response?.status === 429
}

/**
 * Check if should retry on error
 */
export function shouldRetry(error: any): boolean {
  const status = error?.response?.status
  // Retry on server errors and rate limits
  return status === 429 || (status >= 500 && status < 600)
}

/**
 * Get retry delay in ms
 */
export function getRetryDelay(attempt: number, error?: any): number {
  // For rate limits, try to use Retry-After header
  if (isRateLimitError(error)) {
    const retryAfter = error?.response?.headers?.['retry-after']
    if (retryAfter) {
      return parseInt(retryAfter) * 1000
    }
  }

  // Exponential backoff: 1s, 2s, 4s, 8s...
  return Math.min(1000 * Math.pow(2, attempt), 32000)
}
