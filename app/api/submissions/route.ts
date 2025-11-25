import { NextRequest, NextResponse } from 'next/server';
import { BatchNumberModel } from '@/lib/models/batch-number.model';
import { CustomerModel } from '@/lib/models/customer.model';
import { ApiResult } from '@/lib/utils/api-result';
import { getRealClientIp, getDeviceInfo, getLocationFromIp } from '@/lib/utils/ip-utils';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, batchNo } = body;

        if (!email || !batchNo) {
            return NextResponse.json(
                ApiResult.error('Email and Batch Number are required'),
                { status: 400 }
            );
        }

        // 1. Validate Batch Number
        const batch = await BatchNumberModel.findByBatchNo(batchNo);
        if (!batch) {
            return NextResponse.json(
                ApiResult.error('Invalid Batch Number. Please check and try again.'),
                { status: 404 }
            );
        }

        // 2. Collect Customer Info
        const ipAddress = await getRealClientIp(req);
        const deviceInfo = getDeviceInfo(req);
        const locationInfo = await getLocationFromIp(ipAddress);

        // Generate customerId from email (MD5 hash for consistency)
        const customerId = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');

        // 3. Create Customer Record
        await CustomerModel.create({
            customerId,
            email,
            batchNoId: batch.id,
            ipAddress,
            device: deviceInfo.device,
            os: deviceInfo.os,
            browser: deviceInfo.browser,
            location: locationInfo.location,
        });

        // 4. Return PDF URL
        return NextResponse.json(
            ApiResult.success({
                pdfUrl: batch.reportPdfUrl,
                productName: batch.product.name,
                packageName: batch.package.packageName,
                submittedAt: new Date().toISOString(),
            })
        );
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to process submission'),
            { status: 500 }
        );
    }
}
