import { NextRequest, NextResponse } from 'next/server';
import { BatchNumberModel } from '@/lib/models/batch-number.model';
import { ApiResult } from '@/lib/utils/api-result';
import { S3UploadService } from '@/lib/services/s3-upload.service';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const batch = await BatchNumberModel.findById(params.id);

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

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if it's a multipart request (file upload) or JSON
        const contentType = req.headers.get('content-type') || '';

        let reportPdfUrl = undefined;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const pdfFile = formData.get('pdfFile') as File | null;

            if (pdfFile) {
                const buffer = Buffer.from(await pdfFile.arrayBuffer());
                const uploadResult = await S3UploadService.uploadFile(
                    buffer,
                    pdfFile.name,
                    pdfFile.type
                );
                reportPdfUrl = uploadResult.Location;
            }
        } else {
            const body = await req.json();
            reportPdfUrl = body.reportPdfUrl;
        }

        const batch = await BatchNumberModel.findById(params.id);
        if (!batch) {
            return NextResponse.json(
                ApiResult.error('Batch number not found'),
                { status: 404 }
            );
        }

        const updatedBatch = await BatchNumberModel.update(params.id, {
            reportPdfUrl,
        });

        return NextResponse.json(ApiResult.success(updatedBatch));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to update batch number'),
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const batch = await BatchNumberModel.findById(params.id);
        if (!batch) {
            return NextResponse.json(
                ApiResult.error('Batch number not found'),
                { status: 404 }
            );
        }

        // Optionally delete the PDF from S3 if it exists
        if (batch.reportPdfUrl) {
            try {
                const key = batch.reportPdfUrl.split('/').pop();
                if (key) {
                    await S3UploadService.deleteFile(key);
                }
            } catch (err) {
                console.error('Failed to delete S3 file:', err);
                // Continue with batch deletion even if S3 delete fails
            }
        }

        await BatchNumberModel.delete(params.id);

        return NextResponse.json(ApiResult.success(null, 'Batch number deleted successfully'));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to delete batch number'),
            { status: 500 }
        );
    }
}
