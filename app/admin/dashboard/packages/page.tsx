'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import {
    Box,
    Package,
    Filter,
    Loader2,
    Edit,
    Eye,
    Trash2,
    X,
    AlertCircle,
    Plus,
} from 'lucide-react'
import { useProducts } from '@/lib/admin/hooks/useProducts'
import { useUpdatePackage, useDeletePackage, useCreatePackage } from '@/lib/admin/hooks/usePackages'

export default function PackagesPage() {
    const [filterProduct, setFilterProduct] = useState<string>('')
    const [sortBy, setSortBy] = useState<'batch-count' | 'product-asc' | 'product-desc'>('product-asc')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<any>(null)
    const [formData, setFormData] = useState({ packageName: '', productId: '' })

    const { data: products = [], isLoading } = useProducts()
    const createPackage = useCreatePackage()
    const updatePackage = useUpdatePackage()
    const deletePackage = useDeletePackage()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.productId || !formData.packageName) {
            alert('Please select a product and enter a package name')
            return
        }
        try {
            await createPackage.mutateAsync({
                productId: formData.productId,
                data: { packageName: formData.packageName }
            })
            setIsAddModalOpen(false)
            setFormData({ packageName: '', productId: '' })
        } catch (error) {
            console.error('Failed to create package:', error)
            alert('Failed to create package. Please try again.')
        }
    }

    // Flatten all packages from all products
    const allPackages = useMemo(() => {
        return products.flatMap(product =>
            (product.packages || []).map(pkg => ({
                ...pkg,
                productName: product.name,
                productId: product.id,
            }))
        )
    }, [products])

    // Filter and sort packages
    const filteredPackages = useMemo(() => {
        let filtered = [...allPackages]

        // Filter by product
        if (filterProduct) {
            filtered = filtered.filter(pkg => pkg.productId === filterProduct)
        }

        // Sort
        switch (sortBy) {
            case 'batch-count':
                filtered.sort((a, b) => (b.batchNumbers?.length || 0) - (a.batchNumbers?.length || 0))
                break
            case 'product-asc':
                filtered.sort((a, b) => {
                    const productCompare = a.productName.localeCompare(b.productName)
                    if (productCompare !== 0) return productCompare
                    return a.packageName.localeCompare(b.packageName)
                })
                break
            case 'product-desc':
                filtered.sort((a, b) => {
                    const productCompare = b.productName.localeCompare(a.productName)
                    if (productCompare !== 0) return productCompare
                    return a.packageName.localeCompare(b.packageName)
                })
                break
        }

        return filtered
    }, [allPackages, filterProduct, sortBy])

    const openViewModal = (pkg: any) => {
        setSelectedPackage(pkg)
        setIsViewModalOpen(true)
    }

    const openEditModal = (pkg: any) => {
        setSelectedPackage(pkg)
        setFormData({ packageName: pkg.packageName, productId: pkg.productId })
        setIsEditModalOpen(true)
    }

    const openDeleteModal = (pkg: any) => {
        setSelectedPackage(pkg)
        setIsDeleteModalOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updatePackage.mutateAsync({
                id: selectedPackage.id,
                data: { packageName: formData.packageName }
            })
            setIsEditModalOpen(false)
            setSelectedPackage(null)
            setFormData({ packageName: '', productId: '' })
        } catch (error) {
            console.error('Failed to update package:', error)
            alert('Failed to update package. Please try again.')
        }
    }

    const handleDelete = async () => {
        try {
            await deletePackage.mutateAsync(selectedPackage.id)
            setIsDeleteModalOpen(false)
            setSelectedPackage(null)
        } catch (error) {
            console.error('Failed to delete package:', error)
            alert('Failed to delete package. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-500 rounded-xl shadow-lg shadow-orange-500/50">
                            <Box className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Manage Packages</h1>
                            <p className="text-slate-600">View and manage all product packages</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <Plus size={20} />
                        Add Package
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="text-slate-400" size={20} />
                        <span className="text-sm font-medium text-slate-700">Filters:</span>
                    </div>

                    <select
                        value={filterProduct}
                        onChange={(e) => setFilterProduct(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                        <option value="">All Products</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'batch-count' | 'product-asc' | 'product-desc')}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                        <option value="batch-count">Batch Count (High to Low)</option>
                        <option value="product-asc">Product Name (A-Z)</option>
                        <option value="product-desc">Product Name (Z-A)</option>
                    </select>

                    {filterProduct && (
                        <button
                            onClick={() => setFilterProduct('')}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Packages List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                        <span className="ml-3 text-slate-600">Loading packages...</span>
                    </div>
                ) : filteredPackages.length === 0 ? (
                    <div className="text-center py-12">
                        <Box className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-600 font-medium">No packages found</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {searchTerm ? 'Try adjusting your search' : 'Create a product and add packages to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Package Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Batches
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredPackages.map((pkg) => (
                                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Package className="text-purple-600" size={18} />
                                                <span className="font-medium text-slate-900">{pkg.productName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Box className="text-orange-600" size={18} />
                                                <span className="text-slate-700">{pkg.packageName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {pkg.batchNumbers?.length || 0} batches
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(pkg.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openViewModal(pkg)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(pkg)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Edit Package"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(pkg)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Package"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            {!isLoading && filteredPackages.length > 0 && (
                <div className="mt-4 text-sm text-slate-600 text-center">
                    Showing {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} across {products.length} product{products.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Add Package Modal */}
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                >
                                    <option value="">Choose a product...</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Package Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.packageName}
                                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    placeholder="e.g. 100gm, 250gm, 500gm"
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
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                >
                                    {createPackage.isPending ? 'Creating...' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-900">Package Details</h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Product</label>
                                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                    <Package className="text-purple-600" size={20} />
                                    <span className="font-medium text-slate-900">{selectedPackage.productName}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Package Name</label>
                                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                                    <Box className="text-orange-600" size={20} />
                                    <span className="font-medium text-slate-900">{selectedPackage.packageName}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Batch Numbers</label>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium text-blue-700">{selectedPackage.batchNumbers?.length || 0} batches</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Created Date</label>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-700">{new Date(selectedPackage.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedPackage && (
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                                <input
                                    type="text"
                                    disabled
                                    value={selectedPackage.productName}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Package Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.packageName}
                                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                    placeholder="e.g. 100gm"
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
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                >
                                    {updatePackage.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-red-600" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete Package?</h2>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to delete &quot;{selectedPackage.packageName}&quot; from {selectedPackage.productName}? This will also delete all associated batch numbers. This action cannot be undone.
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
        </div>
    )
}
