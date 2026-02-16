import type { Metadata } from "next"
import { generateSEOMetadata, subjectMetadata } from "../../../lib/seo"

export const metadata: Metadata = generateSEOMetadata({
  title: subjectMetadata.biology.title,
  description: subjectMetadata.biology.description,
  path: "/mdcat/biology-mcqs",
  keywords: subjectMetadata.biology.keywords,
})
