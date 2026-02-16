import type { Metadata } from "next"
import { generateSEOMetadata, subjectMetadata } from "../../../lib/seo"
import ChemistryMCQsClient from "./client"

export const metadata: Metadata = generateSEOMetadata({
  title: subjectMetadata.chemistry.title,
  description: subjectMetadata.chemistry.description,
  path: "/mdcat/chemistry-mcqs",
  keywords: subjectMetadata.chemistry.keywords,
})

export default function ChemistryMCQsPage() {
  return <ChemistryMCQsClient />
}
