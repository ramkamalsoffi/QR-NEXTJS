export interface SubmissionRequest {
  email: string;
  batchNo: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    pdfUrl: string;
    productName: string;
    submittedAt: string;
  };
}

