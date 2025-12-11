import prisma from '../prisma';

export interface CreateBatchNumberDto {
    productId: string;
    packageId: string;
    batchNo: string;
    reportPdfUrl?: string;
}

export interface UpdateBatchNumberDto {
    reportPdfUrl?: string;
}

export class BatchNumberModel {
    /**
     * Get all batch numbers
     */
    static async findAll() {
        return await prisma.batchNumber.findMany({
            include: {
                product: true,
                package: true,
                customers: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get batch numbers by product ID
     */
    static async findByProductId(productId: string) {
        return await prisma.batchNumber.findMany({
            where: { productId },
            include: {
                product: true,
                package: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get batch numbers by package ID
     */
    static async findByPackageId(packageId: string) {
        return await prisma.batchNumber.findMany({
            where: { packageId },
            include: {
                product: true,
                package: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get batch number by batch number string
     */
    static async findByBatchNo(batchNo: string) {
        return await prisma.batchNumber.findUnique({
            where: { batchNo },
            include: {
                product: true,
                package: true,
            },
        });
    }

    /**
     * Get batch number by ID
     */
    static async findById(id: string) {
        return await prisma.batchNumber.findUnique({
            where: { id },
            include: {
                product: true,
                package: true,
                customers: true,
            },
        });
    }

    /**
     * Create a new batch number with provided batch number
     */
    static async create(data: CreateBatchNumberDto) {
        // Validate product and package exist
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });

        const productPackage = await prisma.productPackage.findUnique({
            where: { id: data.packageId },
        });

        if (!product || !productPackage) {
            throw new Error('Product or package not found');
        }

        // Validate batch number is provided
        if (!data.batchNo || data.batchNo.trim() === '') {
            throw new Error('Batch number is required');
        }

        // Normalize batch number (trim and convert to uppercase)
        const batchNo = data.batchNo.trim().toUpperCase();

        // Check if batch number already exists
        const existing = await prisma.batchNumber.findUnique({
            where: { batchNo },
        });

        if (existing) {
            throw new Error(`Batch number ${batchNo} already exists`);
        }

        return await prisma.batchNumber.create({
            data: {
                ...data,
                batchNo,
            },
            include: {
                product: true,
                package: true,
            },
        });
    }

    /**
     * Update a batch number
     */
    static async update(id: string, data: UpdateBatchNumberDto) {
        return await prisma.batchNumber.update({
            where: { id },
            data,
            include: {
                product: true,
                package: true,
            },
        });
    }

    /**
     * Delete a batch number (cascades to customers)
     */
    static async delete(id: string) {
        return await prisma.$transaction(async (tx) => {
            // Delete associated customers
            await tx.customer.deleteMany({
                where: { batchNoId: id },
            });

            return await tx.batchNumber.delete({
                where: { id },
            });
        });
    }
}
