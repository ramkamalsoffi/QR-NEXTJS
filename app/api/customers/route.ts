import { NextRequest, NextResponse } from 'next/server';
import { CustomerModel } from '@/lib/models/customer.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(req: NextRequest) {
    try {
        const customers = await CustomerModel.findAll();
        return NextResponse.json(ApiResult.success(customers));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch customers'),
            { status: 500 }
        );
    }
}
