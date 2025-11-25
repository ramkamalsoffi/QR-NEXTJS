import prisma from '../prisma';
import { generateBatchNumber } from '../utils/batch-generator';

export interface CreateBatchNumberDto {
    productId: string;
    packageId: string;
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
     * Create a new batch number with auto-generated batch code
     */
    static async create(data: CreateBatchNumberDto) {
        // Get product and package to generate batch number
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });

        const productPackage = await prisma.productPackage.findUnique({
            where: { id: data.packageId },
        });

        if (!product || !productPackage) {
            throw new Error('Product or package not found');
        }

        // Generate batch number
        const batchNo = generateBatchNumber(product.name, productPackage.packageName);

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
     * Delete a batch number
     */
    static async delete(id: string) {
        return await prisma.batchNumber.delete({
            where: { id },
        });
    }
}
