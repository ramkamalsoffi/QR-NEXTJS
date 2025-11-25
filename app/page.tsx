'use client'

import { useState } from 'react'
import { Mail, Hash, Send, AlertCircle } from 'lucide-react'
import { submissionApi } from '@/lib/frontend/api/submission'

export default function Home() {
  const [email, setEmail] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email || !batchNo) {
      setError('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Call the submission API
      const response = await submissionApi.submit({
        email,
        batchNo,
      })

      if (response.success && response.data) {
        // Redirect to PDF viewer page with download animation
        const params = new URLSearchParams({
          url: response.data.pdfUrl,
          product: response.data.productName || 'Report'
        })
        window.location.href = `/pdf?${params.toString()}`
      } else {
        setError(response.message || 'Failed to submit form. Please try again.')
      }
    } catch (err: any) {
      console.error('Submission error:', err)
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please check your batch number and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 via-blue-50 to-purple-100"></div>

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-6000"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-8000"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-10000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-100/50 relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
                <Hash className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Submit Information
              </h1>
              <p className="text-slate-600">
                Enter your batch number and email address
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all"
                    placeholder="your.email@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Batch Number Field */}
              <div>
                <label
                  htmlFor="batchNo"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Batch Number
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    id="batchNo"
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all"
                    placeholder="BATCH-001"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Getting Report...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Get the Report
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Your information is secure and encrypted</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Powered by QR Demo</span>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

