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
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
