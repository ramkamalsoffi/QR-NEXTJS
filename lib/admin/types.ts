export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Product {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  packages?: ProductPackage[];
  batchNumbers?: BatchNumber[];
}

export interface CreateProductDto {
  name: string;
}

export interface UpdateProductDto {
  name?: string;
}

export interface ProductPackage {
  id: string;
  productId: string;
  product?: Product;
  packageName: string;
  createdAt: string;
  updatedAt: string;
  batchNumbers?: BatchNumber[];
}

export interface CreateProductPackageDto {
  productId: string;
  packageName: string;
}

export interface UpdateProductPackageDto {
  packageName?: string;
}

export interface BatchNumber {
  id: string;
  productId: string;
  product?: Product;
  packageId: string;
  package?: ProductPackage;
  batchNo: string;
  reportPdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  customers?: Customer[];
}

export interface CreateBatchNumberDto {
  productId: string;
  packageId: string;
  pdfFile?: File;
}

export interface UpdateBatchNumberDto {
  pdfFile?: File;
}

export interface Customer {
  id: string;
  customerId: string;
  email: string;
  batchNoId: string;
  batchNumber?: BatchNumber;
  ipAddress: string;
  device?: string | null;
  os?: string | null;
  location?: string | null;
  browser?: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  email: string;
  batchNoId: string;
  ipAddress: string;
  device?: string;
  os?: string;
  location?: string;
  browser?: string;
}

export interface UpdateCustomerDto {
  email?: string;
}

export interface UniqueCustomer {
  customerId: string;
  email: string;
  submissionCount: number;
  lastSubmittedAt: string | null;
  latestSubmission: Customer | null;
}
