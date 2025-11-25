'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import {
    Plus,
    Filter,
    Edit2,
    Trash2,
    Package,
    ChevronRight,
    AlertCircle,
    X,
    ArrowLeft
} from 'lucide-react'
import { useProductPackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '@/lib/admin/hooks/usePackages'
import { useProduct } from '@/lib/admin/hooks/useProducts'
import Link from 'next/link'

export default function ProductPackagesPage({ params }: { params: { id: string } }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<any>(null)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'batch-asc' | 'batch-desc'>('asc')
    const [formData, setFormData] = useState({ packageName: '' })

    const { data: product, isLoading: isProductLoading } = useProduct(params.id)
    const { data: packages, isLoading: isPackagesLoading, error } = useProductPackages(params.id)

    const createPackage = useCreatePackage()
    const updatePackage = useUpdatePackage()
    const deletePackage = useDeletePackage()

    const filteredPackages = useMemo(() => {
        if (!packages) return []

        let sorted = [...packages]

        switch (sortOrder) {
            case 'asc':
                sorted.sort((a, b) => a.packageName.localeCompare(b.packageName))
                break
            case 'desc':
                sorted.sort((a, b) => b.packageName.localeCompare(a.packageName))
                break
            case 'batch-asc':
                sorted.sort((a, b) => (a.batchNumbers?.length || 0) - (b.batchNumbers?.length || 0))
                break
            case 'batch-desc':
                sorted.sort((a, b) => (b.batchNumbers?.length || 0) - (a.batchNumbers?.length || 0))
                break
        }

        return sorted
    }, [packages, sortOrder])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createPackage.mutateAsync({
                productId: params.id,
                data: formData
            })
            setIsAddModalOpen(false)
            setFormData({ packageName: '' })
        } catch (error) {
            console.error('Failed to create package:', error)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updatePackage.mutateAsync({
                id: selectedPackage.id,
                data: formData
            })
            setIsEditModalOpen(false)
            setSelectedPackage(null)
            setFormData({ packageName: '' })
        } catch (error) {
            console.error('Failed to update package:', error)
        }
    }

    const handleDelete = async () => {
        try {
            await deletePackage.mutateAsync(selectedPackage.id)
            setIsDeleteModalOpen(false)
            setSelectedPackage(null)
        } catch (error) {
            console.error('Failed to delete package:', error)
        }
    }

    const openEditModal = (pkg: any) => {
        setSelectedPackage(pkg)
        setFormData({ packageName: pkg.packageName })
        setIsEditModalOpen(true)
    }

    const openDeleteModal = (pkg: any) => {
        setSelectedPackage(pkg)
        setIsDeleteModalOpen(true)
    }

    if (isProductLoading || isPackagesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
                <AlertCircle size={48} className="mb-4" />
                <p className="text-lg font-semibold">Error loading packages</p>
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
                        { label: 'Products', href: '/admin/dashboard/products' },
                        { label: product.name, href: `/admin/dashboard/products/${product.id}/packages`, active: true },
                    ]}
                />
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Package
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/admin/dashboard/products"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Packages</h1>
                    <p className="text-slate-500">For product: {product.name}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="text-slate-400" size={20} />
                        <span className="text-sm font-medium text-slate-700">Sort by:</span>
                    </div>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        <option value="asc">Package Name (A-Z)</option>
                        <option value="desc">Package Name (Z-A)</option>
                        <option value="batch-asc">Batch Count (Low to High)</option>
                        <option value="batch-desc">Batch Count (High to Low)</option>
                    </select>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages?.map((pkg) => (
                    <div
                        key={pkg.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Package className="text-blue-600" size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(pkg)}
                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(pkg)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{pkg.packageName}</h3>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                            <span className="text-sm text-slate-500">
                                {pkg.batchNumbers?.length || 0} Batches
                            </span>
                            <Link
                                href={`/admin/dashboard/batches?packageId=${pkg.id}`}
                                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                View Batches
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPackages?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                    <Package className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-900">No packages found</h3>
                    <p className="text-slate-500 mt-1">Add a package variant for this product.</p>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-900">Add New Package</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Package Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.packageName}
                                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    placeholder="e.g. 100mg, 500g, 1kg"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createPackage.isPending}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {createPackage.isPending ? 'Creating...' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-900">Edit Package</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Package Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.packageName}
                                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatePackage.isPending}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {updatePackage.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-red-600" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete Package?</h2>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to delete &quot;{selectedPackage?.packageName}&quot;? This will also delete all associated batch numbers. This action cannot be undone.
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
                                    disabled={deletePackage.isPending}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {deletePackage.isPending ? 'Deleting...' : 'Delete Package'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
