import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marmaladetech.com"
const SITE_NAME = "MDCAT Expert"
const SITE_DESCRIPTION = "Master MDCAT with Pakistan's most focused exam prep platform. Practice 10,000+ high-yield MCQs in Biology, Chemistry, Physics & English. Free, exam-accurate questions with instant feedback."

interface SEOConfig {
  title: string
  description: string
  path?: string
  image?: string
  noindex?: boolean
  keywords?: string[]
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    path = "",
    image = "/images/og-default.png",
    noindex = false,
    keywords = [],
  } = config

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const url = `${SITE_URL}${path}`

  const defaultKeywords = [
    "MDCAT",
    "MDCAT MCQs",
    "MDCAT preparation",
    "medical entry test",
    "Pakistan medical college",
    "NUMS",
    "KEMU",
    "practice questions",
  ]

  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords].join(", "),
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    ...(noindex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      type: "website",
      locale: "en_PK",
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${SITE_URL}${image}`],
      creator: "@marmaladetech",
    },
    alternates: {
      canonical: url,
    },
  }
}

// Subject-specific metadata generators
export const subjectMetadata = {
  biology: {
    title: "MDCAT Biology MCQs – Free Practice Questions & Tests",
    description: "Master MDCAT Biology with 3000+ high-yield MCQs covering Biodiversity, Cell Biology, Genetics, Bioenergetics & more. Updated for latest syllabus.",
    keywords: ["MDCAT biology", "biology MCQs", "biodiversity questions", "cell biology practice", "genetics MCQs"],
  },
  chemistry: {
    title: "MDCAT Chemistry MCQs – Organic, Physical & Inorganic",
    description: "Practice 2500+ MDCAT Chemistry MCQs covering Atomic Structure, Chemical Bonding, Organic Chemistry, Stoichiometry & Thermodynamics.",
    keywords: ["MDCAT chemistry", "organic chemistry MCQs", "chemical bonding", "stoichiometry practice"],
  },
  physics: {
    title: "MDCAT Physics MCQs – Numericals & Conceptual Questions",
    description: "Solve 2000+ Physics MCQs for MDCAT including Mechanics, Electricity, Magnetism, Waves, Modern Physics with detailed solutions.",
    keywords: ["MDCAT physics", "physics numericals", "mechanics MCQs", "electricity magnetism"],
  },
  english: {
    title: "MDCAT English MCQs – Vocabulary & Comprehension Practice",
    description: "Improve your English score with 1500+ MCQs on Vocabulary, Synonyms, Antonyms, Analogies, and Reading Comprehension.",
    keywords: ["MDCAT English", "vocabulary MCQs", "comprehension practice", "synonyms antonyms"],
  },
  logical: {
    title: "MDCAT Logical Reasoning MCQs – Analytical Thinking Tests",
    description: "Sharpen your analytical skills with 1000+ Logical Reasoning MCQs covering Patterns, Series, Analogies & Problem Solving.",
    keywords: ["logical reasoning", "MDCAT aptitude", "pattern recognition", "analytical thinking"],
  },
}

// Structured data generators (JSON-LD)
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    sameAs: [
      "https://twitter.com/marmaladetech",
      "https://facebook.com/marmaladetech",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@marmaladetech.com",
    },
  }
}

export function generateWebPageSchema(title: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${path}`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  }
}

export function generateCourseSchema(subject: string) {
  const subjectData = subjectMetadata[subject as keyof typeof subjectMetadata]
  
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `MDCAT ${subject.charAt(0).toUpperCase() + subject.slice(1)} Preparation`,
    description: subjectData.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    educationalLevel: "Medical Entry Test",
    teaches: `${subject.charAt(0).toUpperCase() + subject.slice(1)} for MDCAT`,
    courseCode: `MDCAT-${subject.toUpperCase()}`,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT2H",
    },
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
