import { api } from './client'
import { z } from 'zod'

const passwordResetRequestSchema = z.object({
    detail: z.string(),
})

const passwordResetConfirmSchema = z.object({
    detail: z.string(),
})

/**
 * Request password reset email
 * Backend: POST /api/auth/password-reset/
 */
export async function requestPasswordReset(email: string) {
    const res = await api.post('auth/password-reset/', { email })
    return passwordResetRequestSchema.parse(res.data)
}

/**
 * Confirm password reset with token
 * Backend: POST /api/auth/password-reset/confirm/
 */
export async function confirmPasswordReset(uid: string, token: string, newPassword: string) {
    const res = await api.post('auth/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword,
    })
    return passwordResetConfirmSchema.parse(res.data)
}
