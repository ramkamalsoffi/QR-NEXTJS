import { NextRequest, NextResponse } from 'next/server';
import { ProductModel } from '@/lib/models/product.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await ProductModel.findById(params.id);

        if (!product) {
            return NextResponse.json(
                ApiResult.error('Product not found'),
                { status: 404 }
            );
        }

        return NextResponse.json(ApiResult.success(product));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch product'),
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();

        const product = await ProductModel.findById(params.id);
        if (!product) {
            return NextResponse.json(
                ApiResult.error('Product not found'),
                { status: 404 }
            );
        }

        const updatedProduct = await ProductModel.update(params.id, {
            name: body.name,
        });

        return NextResponse.json(ApiResult.success(updatedProduct));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to update product'),
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await ProductModel.findById(params.id);
        if (!product) {
            return NextResponse.json(
                ApiResult.error('Product not found'),
                { status: 404 }
            );
        }

        await ProductModel.delete(params.id);

        return NextResponse.json(ApiResult.success(null, 'Product deleted successfully'));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to delete product'),
            { status: 500 }
        );
    }
}
