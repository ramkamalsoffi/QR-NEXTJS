import apiClient from '../api-client';
import { Customer, CreateCustomerDto, UpdateCustomerDto, ApiResponse } from '../types';

export const customersApi = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers');
    return response.data.data || [];
  },

  // Get customer by ID
  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    if (!response.data.data) {
      throw new Error('Customer not found');
    }
    return response.data.data;
  },

  // Create customer
  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create customer');
    }
    return response.data.data;
  },

  // Update customer
  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update customer');
    }
    return response.data.data;
  },

  // Delete customer
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/customers/${id}`);
  },
};


