import apiClient from '../api-client';
import { Product, CreateProductDto, UpdateProductDto, ApiResponse } from '../types';

export const productsApi = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.data.data || [];
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    if (!response.data.data) {
      throw new Error('Product not found');
    }
    return response.data.data;
  },

  // Create product with PDF upload
  create: async (data: CreateProductDto, pdfFile?: File): Promise<Product> => {
    const formData = new FormData();

    // Add all product data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add PDF file if provided
    if (pdfFile) {
      formData.append('pdfFile', pdfFile);
    }

    const response = await apiClient.post<ApiResponse<Product>>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create product');
    }
    return response.data.data;
  },

  // Update product
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update product');
    }
    return response.data.data;
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
  },
};


