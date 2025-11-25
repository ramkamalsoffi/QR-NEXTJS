import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api-client';
import { Customer, ApiResponse, UniqueCustomer } from '../types';

// API functions
const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers');
    return response.data.data || [];
  },

  getUnique: async (): Promise<UniqueCustomer[]> => {
    const response = await apiClient.get<ApiResponse<UniqueCustomer[]>>('/customers/unique');
    return response.data.data || [];
  },

  getHistory: async (customerId: string): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>(`/customers/history/${customerId}`);
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/customers/${id}`);
  },
};

// Hooks
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
};

export const useUniqueCustomers = () => {
  return useQuery({
    queryKey: ['customers', 'unique'],
    queryFn: customersApi.getUnique,
    staleTime: 0, // Always consider data stale, fetch fresh data
    gcTime: 0, // Don't cache data (formerly cacheTime)
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchInterval: 10000, // Auto-refetch every 10 seconds
  });
};

export const useCustomerHistory = (customerId: string) => {
  return useQuery({
    queryKey: ['customers', 'history', customerId],
    queryFn: () => customersApi.getHistory(customerId),
    enabled: !!customerId,
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      // Invalidate both regular customers and unique customers queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'unique'] });
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['customers', 'unique'] });
    },
  });
};
