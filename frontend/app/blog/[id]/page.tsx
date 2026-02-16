"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { fetchBlog } from "../../../services/api/blogs"
import { Skeleton } from "../../../components/ui/skeleton"
import { Card, CardContent } from "../../../components/ui/card"
import { Calendar, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function BlogDetailPage() {
  const params = useParams()
  const blogId = params?.id as string | undefined

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => fetchBlog(Number(blogId)),
  })

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link href="/blogs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Blogs
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-8 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : error ? (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="text-red-800 pt-6">
              Failed to load blog. Please try again.
            </CardContent>
          </Card>
        ) : !blog ? (
          <Card className="border-2">
            <CardContent className="text-slate-600 pt-6">
              Blog not found
            </CardContent>
          </Card>
        ) : (
          <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{blog.title}</h1>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 border-2 mb-8">
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{
                  __html: blog.content,
                }}
              />
            </div>
          </motion.article>
        )}
      </div>
    </div>
  )
}
