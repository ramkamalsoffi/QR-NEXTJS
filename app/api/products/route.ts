import { NextRequest, NextResponse } from 'next/server';
import { ProductModel } from '@/lib/models/product.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(req: NextRequest) {
    try {
        const products = await ProductModel.findAll();
        return NextResponse.json(ApiResult.success(products));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch products'),
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.name) {
            return NextResponse.json(
                ApiResult.error('Product name is required'),
                { status: 400 }
            );
        }

        // Check if product with same name exists
        const existing = await ProductModel.findByName(body.name);
        if (existing) {
            return NextResponse.json(
                ApiResult.error('Product with this name already exists'),
                { status: 409 }
            );
        }

        const product = await ProductModel.create({
            name: body.name,
        });

        return NextResponse.json(ApiResult.success(product), { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to create product'),
            { status: 500 }
        );
    }
}
