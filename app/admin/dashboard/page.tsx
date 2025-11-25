'use client'

export const dynamic = 'force-dynamic'

import {
  Users,
  Package,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  QrCode,
  Loader2,
} from 'lucide-react'
import { useProducts } from '@/lib/admin/hooks/useProducts'
import { useCustomers } from '@/lib/admin/hooks/useCustomers'
import { useBatches } from '@/lib/admin/hooks/useBatches'

export default function DashboardPage() {
  // Fetch dynamic data
  const { data: products = [], isLoading: isLoadingProducts } = useProducts()
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers()
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches()

  // Calculate stats
  const totalProducts = products.length
  const totalCustomers = customers.length
  // Count batches that have PDFs
  const totalDocuments = batches.filter(batch => batch.reportPdfUrl).length

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 rounded-xl shadow-lg shadow-purple-500/50">
            <BarChart3 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome to your admin panel</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Products</p>
              {isLoadingProducts ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="animate-spin text-purple-600" size={20} />
                  <span className="text-slate-400">Loading...</span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Customers</p>
              {isLoadingCustomers ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="animate-spin text-pink-600" size={20} />
                  <span className="text-slate-400">Loading...</span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-slate-900">{totalCustomers}</p>
              )}
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="text-pink-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Documents</p>
              {isLoadingBatches ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="animate-spin text-green-600" size={20} />
                  <span className="text-slate-400">Loading...</span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-slate-900">{totalDocuments}</p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <a
            href="/admin/dashboard/products"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Package className="text-purple-600" size={20} />
            <span className="font-medium text-slate-900">Manage Products</span>
          </a>

          <a
            href="/admin/dashboard/packages"
            className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Package className="text-orange-600" size={20} />
            <span className="font-medium text-slate-900">Manage Packages</span>
          </a>

          <a
            href="/admin/dashboard/batches"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <QrCode className="text-blue-600" size={20} />
            <span className="font-medium text-slate-900">Manage Batches</span>
          </a>

          <a
            href="/admin/dashboard/customers"
            className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <Users className="text-pink-600" size={20} />
            <span className="font-medium text-slate-900">Manage Customers</span>
          </a>

          <a
            href="/admin/dashboard/qr-scan"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <QrCode className="text-green-600" size={20} />
            <span className="font-medium text-slate-900">QR Scanner</span>
          </a>
        </div>
      </div>
    </div>
  )
}
