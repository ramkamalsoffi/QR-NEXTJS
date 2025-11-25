import { NextRequest, NextResponse } from 'next/server';
import { CustomerModel } from '@/lib/models/customer.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(
    req: NextRequest,
    { params }: { params: { customerId: string } }
) {
    try {
        const customers = await CustomerModel.findByCustomerId(params.customerId);

        if (!customers || customers.length === 0) {
            return NextResponse.json(
                ApiResult.error('No history found for this customer'),
                { status: 404 }
            );
        }

        return NextResponse.json(ApiResult.success(customers));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch customer history'),
            { status: 500 }
        );
    }
}

