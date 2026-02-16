import type { Metadata } from "next"
import { generateSEOMetadata, subjectMetadata } from "../../../lib/seo"
const PhysicsMCQsClient = () => {
  return (
    <div>
      {/* Placeholder for Physics MCQs client component */}
      <p>Physics MCQs will load here.</p>
    </div>
  )
}

export const metadata: Metadata = generateSEOMetadata({
  title: subjectMetadata.physics.title,
  description: subjectMetadata.physics.description,
  path: "/mdcat/physics-mcqs",
  keywords: subjectMetadata.physics.keywords,
})

export default function PhysicsMCQsPage() {
  return <PhysicsMCQsClient />
}
