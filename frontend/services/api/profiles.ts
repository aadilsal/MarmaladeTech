import { api } from "./client"
import { profileSchema, profileListSchema } from "../../types/api"
import { z } from "zod"

/**
 * Profiles Service
 * 
 * Handles user profile fetching and updating.
 * 
 * Two approaches:
 * 1. Django ORM-based: Get/update via API ViewSet (recommended for new code)
 * 2. Traditional Django views: User's profile coupled to auth
 * 
 * This service uses the API ViewSet approach for consistency.
 */

// Profile update payload
const profileUpdateSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  profile_img: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
})

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>

/**
 * ⚠️ IMPORTANT: There are TWO ways to get user's profile:
 * 
 * Method 1 (Recommended):
 * - Call `getCurrentUser()` from auth.ts to get user ID
 * - Then call `fetchProfile(userId)` to get profile data
 * 
 * Method 2 (Legacy):
 * - Use traditional Django user view (redirects to /account/profile/<username>)
 * - Not recommended for API-first frontend
 * 
 * This service implements Method 1.
 */

/**
 * Fetch all profiles (admin feature)
 * Not recommended for regular users
 */
export async function fetchProfiles(page = 1): Promise<any> {
  const res = await api.get("profiles/", {
    params: { page, page_size: 20 },
  })
  
  // Handle both paginated and non-paginated responses
  if (Array.isArray(res.data)) {
    return profileListSchema.parse(res.data)
  }
  return profileListSchema.parse(res.data.results || [])
}

/**
 * Fetch specific user's profile by ID
 * Anyone can view public profile information
 */
export async function fetchProfile(userId: number) {
  const res = await api.get(`profiles/by-user/${userId}/`)
  return profileSchema.parse(res.data)
}

/**
 * Fetch current authenticated user's profile
 * 
 * ⚠️ Dependency: Call `getCurrentUser()` from auth.ts first to get user ID
 * Then call fetchProfile(user.id)
 * 
 * This two-step approach ensures auth is validated before accessing profile.
 */
export async function fetchCurrentUserProfile() {
  try {
    const res = await api.get("profiles/me/")
    return profileSchema.parse(res.data)
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Update current user's profile
 * 
 * ⚠️ Dependency: User must be authenticated
 * Call after verifying getCurrentUser() returns non-null
 */
export async function updateProfile(data: ProfileUpdate) {
  const res = await api.patch("profiles/me/", data)
  return profileSchema.parse(res.data)
}
