import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api-client';
import { BatchNumber, CreateBatchNumberDto, UpdateBatchNumberDto, ApiResponse } from '../types';

// API functions
const batchesApi = {
    getAll: async (): Promise<BatchNumber[]> => {
        const response = await apiClient.get<ApiResponse<BatchNumber[]>>('/batches');
        return response.data.data || [];
    },

    getByProductId: async (productId: string): Promise<BatchNumber[]> => {
        const response = await apiClient.get<ApiResponse<BatchNumber[]>>(`/batches/product/${productId}`);
        return response.data.data || [];
    },

    getByPackageId: async (packageId: string): Promise<BatchNumber[]> => {
        const response = await apiClient.get<ApiResponse<BatchNumber[]>>(`/batches/package/${packageId}`);
        return response.data.data || [];
    },

    getById: async (id: string): Promise<BatchNumber> => {
        const response = await apiClient.get<ApiResponse<BatchNumber>>(`/batches/${id}`);
        return response.data.data;
    },

    create: async (data: CreateBatchNumberDto): Promise<BatchNumber> => {
        const formData = new FormData();
        formData.append('productId', data.productId);
        formData.append('packageId', data.packageId);
        if (data.pdfFile) {
            formData.append('pdfFile', data.pdfFile);
        }

        const response = await apiClient.post<ApiResponse<BatchNumber>>('/batches', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    update: async ({ id, data }: { id: string; data: UpdateBatchNumberDto }): Promise<BatchNumber> => {
        const formData = new FormData();
        if (data.pdfFile) {
            formData.append('pdfFile', data.pdfFile);
        }

        const response = await apiClient.put<ApiResponse<BatchNumber>>(`/batches/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete<ApiResponse<null>>(`/batches/${id}`);
    },
};

// Hooks
export const useBatches = () => {
    return useQuery({
        queryKey: ['batches'],
        queryFn: batchesApi.getAll,
    });
};

export const useProductBatches = (productId: string) => {
    return useQuery({
        queryKey: ['batches', 'product', productId],
        queryFn: () => batchesApi.getByProductId(productId),
        enabled: !!productId,
    });
};

export const usePackageBatches = (packageId: string) => {
    return useQuery({
        queryKey: ['batches', 'package', packageId],
        queryFn: () => batchesApi.getByPackageId(packageId),
        enabled: !!packageId,
    });
};

export const useBatch = (id: string) => {
    return useQuery({
        queryKey: ['batch', id],
        queryFn: () => batchesApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: batchesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Update batch counts in packages
        },
    });
};

export const useUpdateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: batchesApi.update,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['batch', data.id] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Update batch counts in packages
        },
    });
};

export const useDeleteBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: batchesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Update batch counts in packages
        },
    });
};
