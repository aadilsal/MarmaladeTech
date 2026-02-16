import type { Metadata } from "next"
import { generateSEOMetadata, subjectMetadata } from "../../../lib/seo"
import EnglishMCQsClient from "./client"

export const metadata: Metadata = generateSEOMetadata({
  title: subjectMetadata.english.title,
  description: subjectMetadata.english.description,
  path: "/mdcat/english-mcqs",
  keywords: subjectMetadata.english.keywords,
})

export default function EnglishMCQsPage() {
  return <EnglishMCQsClient />
}
