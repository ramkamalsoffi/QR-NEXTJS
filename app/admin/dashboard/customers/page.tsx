'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import {
  Search,
  Trash2,
  Users,
  AlertCircle,
  Eye,
  X,
  Monitor,
  Smartphone,
  Globe,
  Calendar,
  History,
  RefreshCw
} from 'lucide-react'
import { useUniqueCustomers, useDeleteCustomer } from '@/lib/admin/hooks/useCustomers'
import { UniqueCustomer } from '@/lib/admin/types'

export default function CustomersPage() {
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<UniqueCustomer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: uniqueCustomers, isLoading, error, refetch, isRefetching } = useUniqueCustomers()
  const deleteCustomer = useDeleteCustomer()
  
  // Add manual refresh capability
  const handleRefresh = () => {
    refetch()
  }

  const filteredCustomers = uniqueCustomers?.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.latestSubmission?.batchNumber?.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!selectedCustomer?.latestSubmission?.id) return
    try {
      await deleteCustomer.mutateAsync(selectedCustomer.latestSubmission.id)
      setIsDeleteModalOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  }

  const openDetailModal = (customer: UniqueCustomer) => {
    setSelectedCustomer(customer)
    setIsDetailModalOpen(true)
  }

  const openHistoryPage = (customer: UniqueCustomer) => {
    router.push(`/admin/dashboard/customers/${customer.customerId}/history`)
  }

  const openDeleteModal = (customer: UniqueCustomer) => {
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
  }

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
        <p className="text-lg font-semibold">Error loading customers</p>
        <p className="text-sm">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Customers', href: '/admin/dashboard/customers', active: true },
          ]}
        />
        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh customers list"
        >
          <RefreshCw size={18} className={isRefetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by email or batch number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Submissions</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Latest Batch Number</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Latest Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Submitted</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers?.map((customer) => (
                <tr key={customer.customerId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-medium">{customer.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
                      {customer.submissionCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {customer.latestSubmission?.batchNumber?.batchNo ? (
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium">
                        {customer.latestSubmission.batchNumber.batchNo}
                      </span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {customer.latestSubmission?.batchNumber?.product?.name ? (
                      <>
                        {customer.latestSubmission.batchNumber.product.name}
                        {customer.latestSubmission.batchNumber.package?.packageName && (
                          <span className="text-slate-400 ml-1">
                            ({customer.latestSubmission.batchNumber.package.packageName})
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {customer.lastSubmittedAt ? (
                      <>
                        {new Date(customer.lastSubmittedAt).toLocaleDateString()}{' '}
                        {new Date(customer.lastSubmittedAt).toLocaleTimeString()}
                      </>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openHistoryPage(customer)}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View History"
                      >
                        <History size={18} />
                      </button>
                      {customer.latestSubmission && (
                        <>
                          <button
                            onClick={() => openDetailModal(customer)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers?.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900">No customers found</h3>
            <p className="text-slate-500 mt-1">Customer submissions will appear here.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedCustomer?.latestSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">Customer Details</h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                  <p className="text-slate-900 font-medium mt-1">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted At</label>
                  <div className="flex items-center gap-2 mt-1 text-slate-900">
                    <Calendar size={16} className="text-slate-400" />
                    {new Date(selectedCustomer.latestSubmission.submittedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Product Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Batch Number</label>
                    <p className="font-mono text-purple-700 font-medium">
                      {selectedCustomer.latestSubmission.batchNumber?.batchNo || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Product</label>
                    <p className="text-slate-900">
                      {selectedCustomer.latestSubmission.batchNumber?.product?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Package</label>
                    <p className="text-slate-900">
                      {selectedCustomer.latestSubmission.batchNumber?.package?.packageName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Device & Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">IP Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe size={14} className="text-slate-400" />
                      <span className="text-slate-900">{selectedCustomer.latestSubmission.ipAddress}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Location</label>
                    <p className="text-slate-900">
                      {selectedCustomer.latestSubmission.location || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Device / OS</label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedCustomer.latestSubmission.device === 'Mobile' ? (
                        <Smartphone size={14} className="text-slate-400" />
                      ) : (
                        <Monitor size={14} className="text-slate-400" />
                      )}
                      <span className="text-slate-900">
                        {selectedCustomer.latestSubmission.os || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Browser</label>
                    <p className="text-slate-900">
                      {selectedCustomer.latestSubmission.browser || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete Record?</h2>
              <p className="text-slate-500 mb-6">
                Are you sure you want to delete the latest submission from &quot;{selectedCustomer.email}&quot;? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteCustomer.isPending || !selectedCustomer.latestSubmission}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteCustomer.isPending ? 'Deleting...' : 'Delete Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
