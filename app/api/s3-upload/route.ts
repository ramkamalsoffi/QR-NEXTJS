import { NextRequest, NextResponse } from 'next/server';
import { S3UploadService } from '@/lib/services/s3-upload.service';
import { ApiResult } from '@/lib/utils/api-result';

// POST /api/s3-upload - Upload file to S3
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const rootFolder = formData.get('rootFolder') as string || 'amaramba';
        const subFolder = formData.get('subFolder') as string || 'user_documents';

        if (!file || file.size === 0) {
            const result = ApiResult.error('No file provided', 400);
            return NextResponse.json(result.toJSON(), { status: result.statusCode });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await S3UploadService.uploadFile(
            buffer,
            file.name,
            file.type
        );

        if (uploadResult.Location) {
            const result = ApiResult.success(uploadResult, 'File uploaded successfully');
            return NextResponse.json(result.toJSON(), { status: result.statusCode });
        } else {
            const result = ApiResult.error('Failed to upload file', 500);
            return NextResponse.json(result.toJSON(), { status: result.statusCode });
        }
    } catch (error: any) {
        console.error('Error (s3Upload):', error);
        const result = ApiResult.error(error?.message || 'Failed to upload file', 500);
        return NextResponse.json(result.toJSON(), { status: result.statusCode });
    }
}
