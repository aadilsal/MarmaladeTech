"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { fetchBlogs } from "../../services/api/blogs"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Calendar, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function BlogsPage() {
  const [page, setPage] = useState(1)
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["blogs", page],
    queryFn: () => fetchBlogs(page),
  })

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">MDCAT Blog</h1>
            <p className="text-slate-600 mt-2">
              Tips, strategies, and insights for MDCAT preparation
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-2">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !blogsData || blogsData.length === 0 ? (
          <Card className="border-2 text-center py-12">
            <p className="text-slate-600 text-lg">No blogs available yet</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-6">
              {blogsData.map((blog: any, idx: number) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/blog/${blog.id}`}>
                    <Card className="border-2 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-slate-500 mt-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(blog.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 line-clamp-3 mb-4">{blog.excerpt}</p>
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex gap-4 justify-center mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-slate-600">
                Page {page}
              </span>
              <button
                disabled={!blogsData || blogsData.length === 0}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
