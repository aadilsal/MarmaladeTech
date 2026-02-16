import { api } from './client'
import { z } from 'zod'

// User search result schema
const userSearchResultSchema = z.object({
    id: z.number(),
    username: z.string(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().optional(),
})

export type UserSearchResult = z.infer<typeof userSearchResultSchema>

/**
 * Search for users by username, first name, or last name
 * Backend: GET /api/users/search/?q={query}
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query || query.trim().length === 0) {
        return []
    }

    const res = await api.get('users/search/', {
        params: { q: query, page_size: 20 },
    })

    const users = res.data.results || res.data
    return z.array(userSearchResultSchema).parse(users)
}

/**
 * Delete current user's account
 * Backend: DELETE /api/users/me/
 */
export async function deleteAccount(): Promise<void> {
    await api.delete('users/me/')
}
