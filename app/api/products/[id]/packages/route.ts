import { NextRequest, NextResponse } from 'next/server';
import { ProductPackageModel } from '@/lib/models/product-package.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } } // id is productId here
) {
    try {
        const packages = await ProductPackageModel.findByProductId(params.id);
        return NextResponse.json(ApiResult.success(packages));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch packages'),
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } } // id is productId here
) {
    try {
        const body = await req.json();

        if (!body.packageName) {
            return NextResponse.json(
                ApiResult.error('Package name is required'),
                { status: 400 }
            );
        }

        const pkg = await ProductPackageModel.create({
            productId: params.id,
            packageName: body.packageName,
        });

        return NextResponse.json(ApiResult.success(pkg), { status: 201 });
    } catch (error: any) {
        // Check for unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                ApiResult.error('Package with this name already exists for this product'),
                { status: 409 }
            );
        }

        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to create package'),
            { status: 500 }
        );
    }
}
