"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { fetchAbout } from "../../services/api/pages"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"

export default function AboutPage() {
  const { data: aboutData, isLoading } = useQuery({
    queryKey: ["about"],
    queryFn: fetchAbout,
  })

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">About MDCAT Expert</h1>
          <p className="text-slate-600 text-lg mb-12">
            Your comprehensive platform for MDCAT preparation
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-2">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {aboutData?.title && (
                <div className="space-y-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>About Our Platform</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-700">
                      <p><strong>Title:</strong> {aboutData.title}</p>
                      <p><strong>Description:</strong> {aboutData.description}</p>
                    </CardContent>
                  </Card>

                  {aboutData.mission && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Our Mission</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700">{aboutData.mission}</p>
                      </CardContent>
                    </Card>
                  )}

                  {aboutData.vision && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Our Vision</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700">{aboutData.vision}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

            {!aboutData?.title && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>About Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-700">
                  <p>
                    MDCAT Expert is a comprehensive online platform designed to help students prepare for
                    the Medical College Admission Test (MDCAT). Our mission is to provide high-quality
                    educational resources and tools that make MDCAT preparation more effective and
                    accessible.
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 mt-4">What We Offer</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Thousands of practice questions with detailed explanations</li>
                    <li>Subject-wise organization for focused learning</li>
                    <li>Real-time performance analytics and insights</li>
                    <li>Global leaderboard to compete with peers</li>
                    <li>AI-powered explanations for better understanding</li>
                    <li>Expert blog posts and study tips</li>
                  </ul>
                  <h3 className="text-lg font-semibold text-slate-900 mt-4">Our Commitment</h3>
                  <p>
                    We are committed to supporting students on their MDCAT journey by providing accurate,
                    up-to-date content and innovative learning tools. We believe in making quality
                    education accessible to all aspiring medical professionals.
                  </p>
                </CardContent>
              </Card>
            )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
