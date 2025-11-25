import { NextRequest, NextResponse } from 'next/server';
import { ProductPackageModel } from '@/lib/models/product-package.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();

        const pkg = await ProductPackageModel.findById(params.id);
        if (!pkg) {
            return NextResponse.json(
                ApiResult.error('Package not found'),
                { status: 404 }
            );
        }

        const updatedPkg = await ProductPackageModel.update(params.id, {
            packageName: body.packageName,
        });

        return NextResponse.json(ApiResult.success(updatedPkg));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to update package'),
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const pkg = await ProductPackageModel.findById(params.id);
        if (!pkg) {
            return NextResponse.json(
                ApiResult.error('Package not found'),
                { status: 404 }
            );
        }

        await ProductPackageModel.delete(params.id);

        return NextResponse.json(ApiResult.success(null, 'Package deleted successfully'));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to delete package'),
            { status: 500 }
        );
    }
}
