import { NextRequest, NextResponse } from 'next/server';
import { BatchNumberModel } from '@/lib/models/batch-number.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const batches = await BatchNumberModel.findByProductId(params.productId);
        return NextResponse.json(ApiResult.success(batches));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch batch numbers'),
            { status: 500 }
        );
    }
}
