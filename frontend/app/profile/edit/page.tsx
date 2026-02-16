"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery, useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { fetchCurrentUserProfile, updateProfile } from "../../../services/api/profiles"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Skeleton } from "../../../components/ui/skeleton"

export default function EditProfilePage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    location: "",
    gender: "",
    bio: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const profileQuery = useQuery({
    queryKey: ["current-profile"],
    queryFn: fetchCurrentUserProfile,
  })

  // Update form data when profile loads
  useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        first_name: profileQuery.data.user.first_name || "",
        last_name: profileQuery.data.user.last_name || "",
        location: profileQuery.data.location || "",
        gender: profileQuery.data.gender || "",
        bio: profileQuery.data.bio || "",
      })
    }
  }, [profileQuery.data])

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setSuccess("Profile updated successfully!")
      setError("")
      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Failed to update profile")
      setSuccess("")
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    updateMutation.mutate({
      first_name: formData.first_name || undefined,
      last_name: formData.last_name || undefined,
      location: formData.location || undefined,
      gender: formData.gender || undefined,
      bio: formData.bio || undefined,
    })
  }

  if (profileQuery.isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <Link href="/profile" className="text-brand-600 hover:text-brand-700 font-medium mb-4 inline-block">
              ← Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
            <p className="text-slate-600 mt-2">Update your account information</p>
          </div>
        </motion.div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  {success}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Your first name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Your last name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Not specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-600 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/profile")}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
