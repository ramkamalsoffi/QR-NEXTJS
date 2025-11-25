import { NextRequest, NextResponse } from 'next/server';
import { BatchNumberModel } from '@/lib/models/batch-number.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(
    req: NextRequest,
    { params }: { params: { batchNo: string } }
) {
    try {
        const batch = await BatchNumberModel.findByBatchNo(params.batchNo);

        if (!batch) {
            return NextResponse.json(
                ApiResult.error('Batch number not found'),
                { status: 404 }
            );
        }

        return NextResponse.json(ApiResult.success(batch));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch batch number'),
            { status: 500 }
        );
    }
}
