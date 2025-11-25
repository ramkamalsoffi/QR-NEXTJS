'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useMemo } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import { ToastContainer, Toast } from '@/components/Toast'
import {
    Plus,
    Filter,
    Edit2,
    Trash2,
    FileText,
    AlertCircle,
    X,
    Upload,
    QrCode
} from 'lucide-react'
import { useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from '@/lib/admin/hooks/useBatches'
import { useProducts } from '@/lib/admin/hooks/useProducts'
import { useProductPackages } from '@/lib/admin/hooks/usePackages'

export default function BatchesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState<any>(null)

    // Filter state
    const [filterProduct, setFilterProduct] = useState<string>('')
    const [filterPackage, setFilterPackage] = useState<string>('')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Form state
    const [selectedProductId, setSelectedProductId] = useState('')
    const [selectedPackageId, setSelectedPackageId] = useState('')
    const [batchNo, setBatchNo] = useState('')
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // Toast state
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (message: string, type: Toast['type'] = 'error') => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, { id, message, type }])
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const { data: batches, isLoading: isBatchesLoading, error } = useBatches()
    const { data: products } = useProducts()
    // Fetch packages for selected product in add modal
    const { data: packages } = useProductPackages(selectedProductId)

    const createBatch = useCreateBatch()
    const updateBatch = useUpdateBatch()
    const deleteBatch = useDeleteBatch()

    const filteredBatches = useMemo(() => {
        if (!batches) return []

        let filtered = [...batches]

        // Filter by product
        if (filterProduct) {
            filtered = filtered.filter(batch => batch.productId === filterProduct)
        }

        // Filter by package
        if (filterPackage) {
            filtered = filtered.filter(batch => batch.packageId === filterPackage)
        }

        // Sort by batch number
        filtered.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.batchNo.localeCompare(b.batchNo)
            } else {
                return b.batchNo.localeCompare(a.batchNo)
            }
        })

        return filtered
    }, [batches, filterProduct, filterPackage, sortOrder])

    // Get unique packages from filtered batches for package filter
    const availablePackages = useMemo(() => {
        if (!batches) return []
        let filteredBatches = batches
        
        // If product is selected, only show packages from that product
        if (filterProduct) {
            filteredBatches = filteredBatches.filter(batch => batch.productId === filterProduct)
        }
        
        const packages = filteredBatches
            .map(batch => batch.package)
            .filter((pkg, index, self) =>
                pkg && self.findIndex(p => p?.id === pkg.id) === index
            )
        return packages
    }, [batches, filterProduct])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!batchNo || batchNo.trim() === '') {
            showToast('Please enter a batch number', 'error')
            return
        }
        try {
            await createBatch.mutateAsync({
                productId: selectedProductId,
                packageId: selectedPackageId,
                batchNo: batchNo.trim(),
                pdfFile: pdfFile || undefined
            })
            setIsAddModalOpen(false)
            resetForm()
            showToast('Batch created successfully!', 'success')
        } catch (error: any) {
            console.error('Failed to create batch:', error)
            // Extract error message from axios response
            const errorMessage = error?.response?.data?.message || 
                                error?.response?.data?.error || 
                                error?.message || 
                                'Failed to create batch'
            
            // Check if it's a duplicate batch number error
            const lowerMessage = errorMessage.toLowerCase()
            if (lowerMessage.includes('already exists') || 
                lowerMessage.includes('duplicate') || 
                lowerMessage.includes('unique constraint') ||
                lowerMessage.includes('batch number') && lowerMessage.includes('exists')) {
                showToast(`Batch number "${batchNo.trim()}" already exists. Please use a different batch number.`, 'error')
            } else {
                showToast(errorMessage, 'error')
            }
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateBatch.mutateAsync({
                id: selectedBatch.id,
                data: {
                    pdfFile: pdfFile || undefined
                }
            })
            setIsEditModalOpen(false)
            setIsUploadModalOpen(false)
            setSelectedBatch(null)
            resetForm()
        } catch (error) {
            console.error('Failed to update batch:', error)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteBatch.mutateAsync(selectedBatch.id)
            setIsDeleteModalOpen(false)
            setSelectedBatch(null)
        } catch (error) {
            console.error('Failed to delete batch:', error)
        }
    }

    const resetForm = () => {
        setSelectedProductId('')
        setSelectedPackageId('')
        setBatchNo('')
        setPdfFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const openUploadModal = (batch: any) => {
        setSelectedBatch(batch)
        setIsUploadModalOpen(true)
    }

    const openEditModal = (batch: any) => {
        setSelectedBatch(batch)
        setIsEditModalOpen(true)
    }

    const openDeleteModal = (batch: any) => {
        setSelectedBatch(batch)
        setIsDeleteModalOpen(true)
    }

    if (isBatchesLoading) {
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
                <p className="text-lg font-semibold">Error loading batches</p>
                <p className="text-sm">Please try again later</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onClose={removeToast} />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/admin/dashboard' },
                        { label: 'Batch Numbers', href: '/admin/dashboard/batches', active: true },
                    ]}
                />
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus size={20} />
                    Create Batch
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="text-slate-400" size={20} />
                        <span className="text-sm font-medium text-slate-700">Filters:</span>
                    </div>

                    <select
                        value={filterProduct}
                        onChange={(e) => {
                            setFilterProduct(e.target.value)
                            // Don't reset package filter - let user keep their selection
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        <option value="">All Products</option>
                        {products?.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <select
                        value={filterPackage}
                        onChange={(e) => setFilterPackage(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        <option value="">All Packages</option>
                        {availablePackages?.map(pkg => pkg && (
                            <option key={pkg.id} value={pkg.id}>{pkg.packageName}</option>
                        ))}
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        <option value="asc">Batch Number (A-Z)</option>
                        <option value="desc">Batch Number (Z-A)</option>
                    </select>

                    {(filterProduct || filterPackage) && (
                        <button
                            onClick={() => {
                                setFilterProduct('')
                                setFilterPackage('')
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Batches Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Batch Number</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Product</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Package</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">PDF Report</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Created At</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBatches?.map((batch) => (
                                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="text-purple-600" size={18} />
                                            <span className="font-medium text-slate-900">{batch.batchNo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{batch.product?.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{batch.package?.packageName}</td>
                                    <td className="px-6 py-4">
                                        {batch.reportPdfUrl ? (
                                            <a
                                                href={batch.reportPdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <FileText size={16} />
                                                View PDF
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-sm">No PDF</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(batch.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openUploadModal(batch)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Upload PDF"
                                            >
                                                <Upload size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(batch)}
                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(batch)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
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

                {filteredBatches?.length === 0 && (
                    <div className="text-center py-12">
                        <QrCode className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-slate-900">No batches found</h3>
                        <p className="text-slate-500 mt-1">Create a new batch to get started.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-900">Create New Batch</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {/* Product Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                                <select
                                    required
                                    value={selectedProductId}
                                    onChange={(e) => {
                                        setSelectedProductId(e.target.value)
                                        setSelectedPackageId('') // Reset package when product changes
                                    }}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                >
                                    <option value="">Select a product...</option>
                                    {products?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Package Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Package</label>
                                <select
                                    required
                                    disabled={!selectedProductId}
                                    value={selectedPackageId}
                                    onChange={(e) => setSelectedPackageId(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">Select a package...</option>
                                    {packages?.map(p => (
                                        <option key={p.id} value={p.id}>{p.packageName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Batch Number Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
                                <input
                                    type="text"
                                    required
                                    value={batchNo}
                                    onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
                                    placeholder="e.g., PE100MG, CH500MG"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Enter a unique batch number</p>
                            </div>

                            {/* PDF Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Report PDF (Optional)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                    <p className="text-sm text-slate-600">
                                        {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                                    </p>
                                </div>
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
                                    disabled={createBatch.isPending || !selectedProductId || !selectedPackageId}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {createBatch.isPending ? 'Creating...' : 'Create Batch'}
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
                            <h2 className="text-xl font-semibold text-slate-900">Edit Batch {selectedBatch?.batchNo}</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            {/* PDF Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Update Report PDF</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                    <p className="text-sm text-slate-600">
                                        {pdfFile ? pdfFile.name : 'Click to upload new PDF'}
                                    </p>
                                </div>
                                {selectedBatch?.reportPdfUrl && !pdfFile && (
                                    <p className="text-xs text-slate-500 mt-2">Current PDF: <a href={selectedBatch.reportPdfUrl} target="_blank" className="text-blue-600 hover:underline">View</a></p>
                                )}
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
                                    disabled={updateBatch.isPending}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {updateBatch.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload PDF Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-900">Upload PDF - {selectedBatch?.batchNo}</h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            {/* PDF Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Report PDF</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                    <p className="text-sm text-slate-600">
                                        {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                                    </p>
                                </div>
                                {selectedBatch?.reportPdfUrl && !pdfFile && (
                                    <p className="text-xs text-slate-500 mt-2">Current PDF: <a href={selectedBatch.reportPdfUrl} target="_blank" className="text-blue-600 hover:underline">View</a></p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsUploadModalOpen(false)
                                        setPdfFile(null)
                                    }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateBatch.isPending || !pdfFile}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {updateBatch.isPending ? 'Uploading...' : 'Upload PDF'}
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
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete Batch?</h2>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to delete batch &quot;{selectedBatch?.batchNo}&quot;? This action cannot be undone.
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
                                    disabled={deleteBatch.isPending}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {deleteBatch.isPending ? 'Deleting...' : 'Delete Batch'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
