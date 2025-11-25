import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api-client';
import { ProductPackage, CreateProductPackageDto, UpdateProductPackageDto, ApiResponse } from '../types';

// API functions
const packagesApi = {
    getByProductId: async (productId: string): Promise<ProductPackage[]> => {
        const response = await apiClient.get<ApiResponse<ProductPackage[]>>(`/products/${productId}/packages`);
        return response.data.data || [];
    },

    getById: async (id: string): Promise<ProductPackage> => {
        const response = await apiClient.get<ApiResponse<ProductPackage>>(`/packages/${id}`);
        return response.data.data;
    },

    create: async ({ productId, data }: { productId: string; data: { packageName: string } }): Promise<ProductPackage> => {
        const response = await apiClient.post<ApiResponse<ProductPackage>>(`/products/${productId}/packages`, data);
        return response.data.data;
    },

    update: async ({ id, data }: { id: string; data: UpdateProductPackageDto }): Promise<ProductPackage> => {
        const response = await apiClient.put<ApiResponse<ProductPackage>>(`/packages/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete<ApiResponse<null>>(`/packages/${id}`);
    },
};

// Hooks
export const useProductPackages = (productId: string) => {
    return useQuery({
        queryKey: ['packages', productId],
        queryFn: () => packagesApi.getByProductId(productId),
        enabled: !!productId,
    });
};

export const usePackage = (id: string) => {
    return useQuery({
        queryKey: ['package', id],
        queryFn: () => packagesApi.getById(id),
        enabled: !!id,
    });
};

export const useCreatePackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: packagesApi.create,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['packages', data.productId] });
        },
    });
};

export const useUpdatePackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: packagesApi.update,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['packages', data.productId] });
            queryClient.invalidateQueries({ queryKey: ['package', data.id] });
        },
    });
};

export const useDeletePackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: packagesApi.delete,
        onSuccess: () => {
            // We need to invalidate all packages queries since we don't know the productId here easily
            // Alternatively, we could pass productId to the delete mutation
            queryClient.invalidateQueries({ queryKey: ['packages'] });
        },
    });
};
