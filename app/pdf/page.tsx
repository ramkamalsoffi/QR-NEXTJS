'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FileText, Download, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

function PDFViewerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pdfUrl = searchParams.get('url')
  const productName = searchParams.get('product') || 'Report'

  const [error, setError] = useState<string | null>(null)
  const [showDownloadAnimation, setShowDownloadAnimation] = useState(true)

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
    }
    
    // Hide download animation after 4 seconds
    if (showDownloadAnimation) {
      const timer = setTimeout(() => {
        setShowDownloadAnimation(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [pdfUrl, showDownloadAnimation])

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${productName.replace(/\s+/g, '_')}_Report.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePdfError = () => {
    setError('Failed to load PDF. Please try downloading it instead.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft size={20} className="text-slate-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-lg">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{productName}</h1>
                  <p className="text-sm text-slate-600">PDF Report</p>
                </div>
              </div>
            </div>
            {pdfUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md shadow-purple-500/50 hover:shadow-lg hover:shadow-purple-600/50 font-medium"
              >
                <Download size={20} />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Animation Banner */}
      {showDownloadAnimation && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg p-6 mb-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 mb-1">Submission Successful!</h3>
                <p className="text-sm text-green-700">
                  Your information has been submitted. Your report is ready to view or download.
                </p>
              </div>
              <button
                onClick={() => setShowDownloadAnimation(false)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-red-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading PDF</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              {pdfUrl && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all font-medium"
                  >
                    <Download size={20} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                  >
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
            {/* PDF Viewer - Show immediately */}
            {pdfUrl && (
              <div className="relative w-full" style={{ minHeight: '80vh' }}>
                <iframe
                  src={pdfUrl}
                  className="w-full border-0 rounded-xl"
                  style={{ minHeight: '80vh', height: '85vh' }}
                  onError={handlePdfError}
                  title={`${productName} PDF Report`}
                />
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">About This Report</h3>
              <p className="text-sm text-slate-600 mb-4">
                This PDF report contains detailed information about the product associated with your batch number.
                You can view it online or download it for offline access.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Secure Document
                </span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                  Official Report
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PDFViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        {/* Show PDF immediately even in fallback */}
      </div>
    }>
      <PDFViewerContent />
    </Suspense>
  )
}

