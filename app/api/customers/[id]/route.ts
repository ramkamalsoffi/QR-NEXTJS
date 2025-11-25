import { NextRequest, NextResponse } from 'next/server';
import { CustomerModel } from '@/lib/models/customer.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customer = await CustomerModel.findById(params.id);

        if (!customer) {
            return NextResponse.json(
                ApiResult.error('Customer not found'),
                { status: 404 }
            );
        }

        return NextResponse.json(ApiResult.success(customer));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch customer'),
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customer = await CustomerModel.findById(params.id);
        if (!customer) {
            return NextResponse.json(
                ApiResult.error('Customer not found'),
                { status: 404 }
            );
        }

        await CustomerModel.delete(params.id);

        return NextResponse.json(ApiResult.success(null, 'Customer deleted successfully'));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to delete customer'),
            { status: 500 }
        );
    }
}
