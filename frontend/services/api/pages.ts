import { api } from "./client"
import { z } from "zod"

/**
 * Pages Service
 * Handles static page content and contact form submissions
 */

// About page response schema
const aboutPageSchema = z.object({
  title: z.string(),
  description: z.string(),
  mission: z.string(),
  vision: z.string(),
  features: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
  team: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
    }),
  ),
  stats: z.object({
    total_questions: z.number(),
    total_users: z.number(),
    success_rate: z.string(),
    average_rating: z.string(),
  }),
})

// Contact form response schema
const contactResponseSchema = z.object({
  detail: z.string(),
})

export type AboutPage = z.infer<typeof aboutPageSchema>
export type ContactResponse = z.infer<typeof contactResponseSchema>

/**
 * Fetch about page content from backend
 * Allows CMS to manage content without frontend redeploy
 */
export async function fetchAbout(): Promise<AboutPage> {
  const res = await api.get("about/")
  return aboutPageSchema.parse(res.data)
}

/**
 * Submit contact form
 * 
 * Request: {
 *   name: string,
 *   email: string,
 *   subject: string,
 *   message: string
 * }
 * 
 * Response: { detail: "Message sent successfully" }
 */
export async function submitContact(
  name: string,
  email: string,
  subject: string,
  message: string,
): Promise<ContactResponse> {
  const res = await api.post("contact/", {
    name,
    email,
    subject,
    message,
  })
  return contactResponseSchema.parse(res.data)
}
