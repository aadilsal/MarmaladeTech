'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Terms & Conditions
          </h1>
          <p className="text-gray-600">
            Last updated: February 8, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using MDCAT Expert, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to these terms, please do not
              use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              2. Use License
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Permission is granted to temporarily access the materials (information or software)
              on MDCAT Expert for personal, non-commercial use only. This is the grant of a
              license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              3. User Account
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password.
              You agree to accept responsibility for all activities that occur under your account.
              We reserve the right to refuse service, terminate accounts, or remove content at our
              sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              4. Content Accuracy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              While we strive to provide accurate and up-to-date MDCAT preparation materials, we
              make no warranties about the completeness, reliability, or accuracy of this
              information. Any reliance you place on such information is strictly at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              5. Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. We collect and use your personal information in
              accordance with our Privacy Policy. By using MDCAT Expert, you consent to our
              collection and use of personal information as outlined in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall MDCAT Expert or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on MDCAT
              Expert, even if we have been notified orally or in writing of the possibility of such
              damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              7. Modifications
            </h2>
            <p className="text-gray-700 leading-relaxed">
              MDCAT Expert may revise these terms of service at any time without notice. By using
              this website you are agreeing to be bound by the then current version of these terms
              of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              8. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws
              of Pakistan and you irrevocably submit to the exclusive jurisdiction of the courts in
              that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              9. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms & Conditions, please contact us through
              our contact page.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/contact')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Have questions? Contact us →
          </button>
        </div>
      </div>
    </div>
  )
}
