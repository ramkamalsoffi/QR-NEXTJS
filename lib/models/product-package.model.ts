import prisma from '../prisma';

export interface CreateProductPackageDto {
    productId: string;
    packageName: string;
}

export interface UpdateProductPackageDto {
    packageName?: string;
}

export class ProductPackageModel {
    /**
     * Get all packages for a product
     */
    static async findByProductId(productId: string) {
        return await prisma.productPackage.findMany({
            where: { productId },
            include: {
                product: true,
                batchNumbers: true,
            },
            orderBy: {
                packageName: 'asc',
            },
        });
    }

    /**
     * Get package by ID
     */
    static async findById(id: string) {
        return await prisma.productPackage.findUnique({
            where: { id },
            include: {
                product: true,
                batchNumbers: true,
            },
        });
    }

    /**
     * Create a new package
     */
    static async create(data: CreateProductPackageDto) {
        return await prisma.productPackage.create({
            data,
            include: {
                product: true,
            },
        });
    }

    /**
     * Update a package
     */
    static async update(id: string, data: UpdateProductPackageDto) {
        return await prisma.productPackage.update({
            where: { id },
            data,
            include: {
                product: true,
            },
        });
    }

    /**
     * Delete a package (cascades to batch numbers)
     */
    static async delete(id: string) {
        return await prisma.$transaction(async (tx) => {
            // Find all batches associated with this package
            const batches = await tx.batchNumber.findMany({
                where: { packageId: id },
                select: { id: true },
            });

            const batchIds = batches.map((b) => b.id);

            if (batchIds.length > 0) {
                // Delete all customers associated with these batches
                await tx.customer.deleteMany({
                    where: {
                        batchNoId: { in: batchIds },
                    },
                });
            }

            // Delete the package (cascades to delete batches)
            return await tx.productPackage.delete({
                where: { id },
            });
        });
    }
}
