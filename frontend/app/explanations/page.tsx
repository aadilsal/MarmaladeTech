"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { generateExplanation, getTaskStatus } from "../../services/api/explanations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"
import { Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react"

export default function ExplanationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const questionId = searchParams?.get("questionId") || null

  const [taskId, setTaskId] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  // Generate explanation mutation
  const generateMutation = useMutation({
    mutationFn: (id: number) => generateExplanation(id),
    onSuccess: (data) => {
      setTaskId(data.task_id)
      setPollCount(0)
    },
  })

  // Poll for task status
  const statusQuery = useQuery({
    queryKey: ["taskStatus", taskId],
    queryFn: () => getTaskStatus(taskId!),
    enabled: !!taskId && !explanation,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  })

  // Update explanation when task completes
  useEffect(() => {
    if (statusQuery.data) {
      if (statusQuery.data.state === "SUCCESS" && statusQuery.data.result) {
        setExplanation(statusQuery.data.result.explanation || statusQuery.data.result)
      }
      if (statusQuery.data.state === "FAILURE") {
        setExplanation(null)
      }
      setPollCount(prev => prev + 1)
    }
  }, [statusQuery.data])

  const handleGenerateExplanation = () => {
    if (questionId) {
      generateMutation.mutate(Number(questionId))
    }
  }

  const isGenerating = taskId && !explanation
  const isFailed = statusQuery.data?.state === "FAILURE"

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-8 h-8 text-yellow-500" />
                AI Explanation Generator
              </h1>
              <p className="text-slate-600">
                Get detailed explanations for MDCAT questions powered by AI
              </p>
            </div>
          </motion.div>
        </div>

        {!questionId ? (
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-4">No question selected</p>
                <p className="text-slate-500 text-sm">
                  Click "Get Explanation" on a quiz question to generate an AI explanation.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-2 mb-6">
              <CardHeader>
                <CardTitle>Question #{questionId}</CardTitle>
                <CardDescription>AI-Powered Explanation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!explanation && !isGenerating && (
                  <button
                    onClick={handleGenerateExplanation}
                    disabled={generateMutation.isPending}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Generate Explanation
                  </button>
                )}

                {isGenerating && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="py-12 text-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                        <Loader2 className="w-12 h-12 text-blue-600 mx-auto" />
                      </motion.div>
                      <p className="text-slate-600 mt-4 font-medium">Generating explanation...</p>
                      <p className="text-slate-500 text-sm mt-1">Polling... ({pollCount}s)</p>
                    </div>
                  </motion.div>
                )}

                {isFailed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Failed to generate explanation
                      </p>
                      <p className="text-red-700 text-sm mt-2">Please try again.</p>
                      <button
                        onClick={handleGenerateExplanation}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </motion.div>
                )}

                {explanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-green-600 font-semibold">Explanation ready</p>
                    </div>
                    <div className="p-6 bg-slate-100 rounded-lg border border-slate-200">
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                          {explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• Explanations are generated by AI and should be verified</p>
                <p>• Read the explanation carefully and try to understand the concept</p>
                <p>• Review related questions to reinforce the concept</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
