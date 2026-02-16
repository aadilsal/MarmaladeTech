"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { BiologyIcon } from "../../../components/icons/SubjectIcons"
import { fetchQuizzes } from "../../../services/api/quizzes"
import { Skeleton } from "../../../components/ui/skeleton"

export default function BiologyMCQsClient() {
  const quizzesQuery = useQuery({
    queryKey: ["quizzes", "biology"],
    queryFn: async () => {
      const allQuizzes = await fetchQuizzes()
      return allQuizzes.filter(q => 
        q.title.toLowerCase().includes("biology") || 
        q.category?.toLowerCase() === "biology"
      )
    },
  })

  const biologicQuizzes = quizzesQuery.data || []
  const totalMCQs = biologicQuizzes.reduce((acc, quiz) => acc + (quiz.question_count || 0), 0)

  // Add FAQ schema to page
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How many MDCAT Biology MCQs are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `We offer ${totalMCQs}+ Biology MCQs covering all MDCAT topics including Biodiversity, Cell Biology, Genetics, Bioenergetics, and Human Physiology.`
        }
      },
      {
        "@type": "Question",
        "name": "Are these Biology questions exam-accurate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all Biology MCQs follow the official MDCAT syllabus and PMC guidelines, mirroring the difficulty level and format of actual exam questions."
        }
      },
      {
        "@type": "Question",
        "name": "Can I practice Biology MCQs for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! All Biology MCQs are completely free. You can practice unlimited questions without any subscription or payment."
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-b">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_300px] items-start">
              <div>
                <div className="inline-flex items-center gap-2 mb-6">
                  <Link href="/" className="text-sm text-slate-600 hover:text-brand-600">Home</Link>
                  <span className="text-slate-400">/</span>
                  <span className="text-sm font-medium text-slate-900">Biology MCQs</span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <BiologyIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
                      MDCAT Biology MCQs
                    </h1>
                    <p className="text-lg text-slate-600">
                      Master all biology topics with exam-pattern practice
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border">
                    <span className="text-2xl font-bold text-green-600">{totalMCQs}+</span>
                    <span className="text-sm text-slate-600">MCQs</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border">
                    <span className="text-2xl font-bold text-green-600">{biologicQuizzes.length}</span>
                    <span className="text-sm text-slate-600">Topic Tests</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border">
                    <span className="text-2xl font-bold text-green-600">100%</span>
                    <span className="text-sm text-slate-600">Free</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="shadow-lg">
                    <Link href="/quizzes">Start Practicing Biology →</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/dashboard">Track Your Progress</Link>
                  </Button>
                </div>
              </div>

              {/* Quick Topics Card */}
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-slate-700">Biodiversity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-slate-700">Cell Biology</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-slate-700">Genetics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-slate-700">Bioenergetics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-slate-700">Human Physiology</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Available Quizzes */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Biology Quizzes</h2>
          
          {quizzesQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : biologicQuizzes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {biologicQuizzes.map(quiz => (
                <Card key={quiz.id} className="card-interactive border-2 hover:border-green-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>
                        {quiz.question_count} questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/quiz/${quiz.id}`}>Start Quiz →</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">Biology quizzes coming soon!</p>
                <Button asChild className="mt-4">
                  <Link href="/quizzes">Browse All Quizzes</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="bg-white border-y">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Why Practice MDCAT Biology MCQs?
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Biology is the highest-weightage subject in MDCAT, comprising approximately <strong>72 out of 200 questions</strong>. 
                Mastering Biology MCQs is essential for securing admission to top medical universities in Pakistan, including 
                King Edward Medical University (KEMU), Allama Iqbal Medical College, and all UHS-affiliated institutions.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Complete MDCAT Biology Syllabus Coverage
              </h3>
              <p className="text-slate-600 mb-4">
                Our Biology MCQs cover all PMC-prescribed topics:
              </p>
              <ul className="space-y-2 text-slate-600 mb-6">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  <span><strong>Biodiversity:</strong> Classification, taxonomy, and kingdoms of life</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  <span><strong>Cell Biology:</strong> Cell structure, transport, and division</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  <span><strong>Genetics:</strong> Mendelian inheritance, DNA, RNA, and molecular genetics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  <span><strong>Bioenergetics:</strong> Photosynthesis, respiration, and energy flow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  <span><strong>Human Physiology:</strong> Organ systems, homeostasis, and immunity</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Exam-Pattern Biology Questions
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                All our Biology MCQs follow the official MDCAT format with single-best-answer questions. Each MCQ tests 
                conceptual understanding rather than rote memorization, helping you develop the analytical thinking required 
                for medical school success.
              </p>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Pro Tip for Biology Preparation</h4>
                <p className="text-slate-700 leading-relaxed">
                  Focus on high-yield topics like Genetics and Human Physiology first, then systematically cover all chapters. 
                  Practice 20-30 Biology MCQs daily for consistent improvement.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">How many Biology questions appear in MDCAT?</h4>
                  <p className="text-slate-600">
                    MDCAT includes 72 Biology MCQs out of 200 total questions, making it the most important subject for your medical college admission.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Are these Biology MCQs updated for 2026?</h4>
                  <p className="text-slate-600">
                    Yes, all MCQs align with the latest PMC syllabus and MDCAT pattern for 2026.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Master MDCAT Biology?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Start practicing today with our comprehensive collection of exam-accurate Biology MCQs. 
            100% free, no registration required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/quizzes">Start Biology Practice →</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/mdcat/chemistry-mcqs">Explore Chemistry MCQs</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
