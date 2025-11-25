import { NextRequest, NextResponse } from 'next/server';
import { BatchNumberModel } from '@/lib/models/batch-number.model';
import { ApiResult } from '@/lib/utils/api-result';
import { S3UploadService } from '@/lib/services/s3-upload.service';

export async function GET(req: NextRequest) {
    try {
        const batches = await BatchNumberModel.findAll();
        return NextResponse.json(ApiResult.success(batches));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch batch numbers'),
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log('=== Batch Creation Request Started ===');
        const formData = await req.formData();
        const productId = formData.get('productId') as string;
        const packageId = formData.get('packageId') as string;
        const batchNo = formData.get('batchNo') as string;
        const pdfFile = formData.get('pdfFile') as File | null;

        console.log('Received data:', { productId, packageId, batchNo, hasPdfFile: !!pdfFile });

        if (!productId || !packageId || !batchNo) {
            console.log('Validation failed: missing required fields');
            return NextResponse.json(
                ApiResult.error('Product ID, Package ID, and Batch Number are required'),
                { status: 400 }
            );
        }

        let reportPdfUrl = undefined;

        // Upload PDF if provided
        if (pdfFile) {
            console.log('Uploading PDF file:', pdfFile.name);
            const buffer = Buffer.from(await pdfFile.arrayBuffer());
            const uploadResult = await S3UploadService.uploadFile(
                buffer,
                pdfFile.name,
                pdfFile.type
            );
            reportPdfUrl = uploadResult.Location;
            console.log('PDF uploaded successfully:', reportPdfUrl);
        } else {
            console.log('No PDF file provided');
        }

        console.log('Creating batch with:', { productId, packageId, batchNo, reportPdfUrl });
        const batch = await BatchNumberModel.create({
            productId,
            packageId,
            batchNo,
            reportPdfUrl,
        });
        console.log('Batch created successfully:', batch.id);

        return NextResponse.json(ApiResult.success(batch), { status: 201 });
    } catch (error: any) {
        console.error('Batch creation error:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to create batch number'),
            { status: 500 }
        );
    }
}
