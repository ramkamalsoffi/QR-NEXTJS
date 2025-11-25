import { NextRequest, NextResponse } from 'next/server';
import { CustomerModel } from '@/lib/models/customer.model';
import { ApiResult } from '@/lib/utils/api-result';

export async function GET(req: NextRequest) {
    try {
        const uniqueCustomers = await CustomerModel.findUniqueCustomers();
        
        // Transform the grouped data to include additional info
        const customersWithDetails = await Promise.all(
            uniqueCustomers.map(async (group) => {
                // Get the most recent customer record for this customerId to get full details
                const recentCustomer = await CustomerModel.findByCustomerId(group.customerId);
                const latest = recentCustomer[0]; // Most recent due to orderBy
                
                return {
                    customerId: group.customerId,
                    email: group.email,
                    submissionCount: group._count.id,
                    lastSubmittedAt: group._max.submittedAt,
                    latestSubmission: latest || null,
                };
            })
        );
        
        return NextResponse.json(ApiResult.success(customersWithDetails));
    } catch (error: any) {
        return NextResponse.json(
            ApiResult.error(error.message || 'Failed to fetch unique customers'),
            { status: 500 }
        );
    }
}

