import "../styles/globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import Providers from "./providers"
import TopNav from "../components/site/TopNav"
import { generateSEOMetadata, generateOrganizationSchema } from "../lib/seo"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

function SiteFooter() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-slate-100 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">MDCAT Expert</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              Pakistan's most focused MDCAT preparation platform. Practice thousands of 
              exam-accurate MCQs with instant feedback. No clutter, no distractions.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Subjects</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/mdcat/biology-mcqs" className="hover:text-brand-600 transition-colors">Biology MCQs</a></li>
              <li><a href="/mdcat/chemistry-mcqs" className="hover:text-brand-600 transition-colors">Chemistry MCQs</a></li>
              <li><a href="/mdcat/physics-mcqs" className="hover:text-brand-600 transition-colors">Physics MCQs</a></li>
              <li><a href="/mdcat/english-mcqs" className="hover:text-brand-600 transition-colors">English MCQs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/quizzes" className="hover:text-brand-600 transition-colors">All Quizzes</a></li>
              <li><a href="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</a></li>
              <li><a href="/about" className="hover:text-brand-600 transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-brand-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-slate-600">
          <p>© {currentYear} Marmalade Tech. All rights reserved. Built for MDCAT aspirants.</p>
        </div>
      </div>
    </footer>
  )
}

export const metadata: Metadata = generateSEOMetadata({
  title: "MDCAT Expert – Practice 10,000+ Free MCQs for Medical Entry Test",
  description: "Master MDCAT with Pakistan's most focused exam prep platform. Practice high-yield MCQs in Biology, Chemistry, Physics & English. Free, exam-accurate questions with instant feedback.",
  path: "/",
  keywords: [
    "MDCAT 2026",
    "UHS MDCAT",
    "PMC MDCAT",
    "medical college Pakistan",
    "free MDCAT practice",
    "NUMS preparation",
  ],
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
      </head>
      <body className="font-sans">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <TopNav />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}

