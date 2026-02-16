import { api } from "./client"
import { z } from "zod"

/**
 * Blogs Service
 * Fetch and display public blog posts
 */

// Blog schema
const blogSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
  }),
  status: z.string(), // "public", "draft", etc.
  created_at: z.string(),
})

const blogListSchema = z.array(blogSchema)

export type Blog = z.infer<typeof blogSchema>

/**
 * Fetch all public blogs (paginated)
 * 
 * Returns: Array of public blog posts ordered by creation date
 */
export async function fetchBlogs(page = 1): Promise<Blog[]> {
  const res = await api.get("blogs/", {
    params: { page, page_size: 10 },
  })
  
  // Handle both paginated and non-paginated responses
  if (Array.isArray(res.data)) {
    return blogListSchema.parse(res.data)
  }
  return blogListSchema.parse(res.data.results || [])
}

/**
 * Fetch single blog post by ID
 * 
 * Returns: Blog post with full content
 */
export async function fetchBlog(id: number): Promise<Blog> {
  const res = await api.get(`blogs/${id}/`)
  return blogSchema.parse(res.data)
}
