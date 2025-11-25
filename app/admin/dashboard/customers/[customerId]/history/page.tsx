'use client'

export const dynamic = 'force-dynamic'

import { useParams, useRouter } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import {
  Monitor,
  Smartphone,
  Globe,
  Calendar,
  FileText,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import { useCustomerHistory } from '@/lib/admin/hooks/useCustomers'
import { Customer } from '@/lib/admin/types'

export default function CustomerHistoryPage({
  params,
}: {
  params: { customerId: string }
}) {
  const router = useRouter()
  const { customerId } = params

  const { data: customerHistory, isLoading, error } = useCustomerHistory(customerId)

  // Get customer email from first submission if available
  const customerEmail = customerHistory && customerHistory.length > 0 ? customerHistory[0].email : ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg font-semibold">Error loading customer history</p>
        <p className="text-sm">Please try again later</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Customers', href: '/admin/dashboard/customers' },
            { label: 'History', href: `/admin/dashboard/customers/${customerId}/history`, active: true },
          ]}
        />
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Customer Info Header */}
      {customerEmail && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Customer History</h2>
          <p className="text-sm text-slate-500 mt-1">{customerEmail}</p>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {customerHistory && customerHistory.length > 0 ? (
          <>
            <div className="p-4 bg-purple-50 border-b border-slate-200">
              <p className="text-sm font-medium text-purple-900">
                Total Submissions: <span className="font-bold">{customerHistory.length}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Batch Number</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Package</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Device / OS</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Browser</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerHistory.map((submission: Customer) => (
                    <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-purple-700 font-medium font-mono">
                          {submission.batchNumber?.batchNo || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900">
                        {submission.batchNumber?.product?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submission.batchNumber?.package?.packageName || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-slate-400" />
                          <span className="text-slate-900">{submission.location || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {submission.device === 'Mobile' ? (
                            <Smartphone size={14} className="text-slate-400" />
                          ) : (
                            <Monitor size={14} className="text-slate-400" />
                          )}
                          <span className="text-slate-900">{submission.os || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submission.browser || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-900">{submission.ipAddress}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900">No history found</h3>
            <p className="text-slate-500 mt-1">No submissions found for this customer.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

