import { NextRequest, NextResponse } from 'next/server';
import { BatchNumberModel } from '@/lib/models/batch-number.model';
import { ApiResult } from '@/lib/utils/api-result';

// GET /api/products/batch/[batchNo] - Get product by batch number
export async function GET(
    request: NextRequest,
    { params }: { params: { batchNo: string } }
) {
    try {
        const batch = await BatchNumberModel.findByBatchNo(params.batchNo);

        if (!batch || !batch.product) {
            const result = ApiResult.error('Product not found with this batch number', 404);
            return NextResponse.json(result.toJSON(), { status: result.statusCode });
        }

        const result = ApiResult.success(batch.product, 'Product retrieved successfully');
        return NextResponse.json(result.toJSON(), { status: result.statusCode });
    } catch (error: any) {
        console.error('Error (getProductByBatchNo):', error);
        const result = ApiResult.error(error?.message || 'Failed to retrieve product', 500);
        return NextResponse.json(result.toJSON(), { status: result.statusCode });
    }
}
