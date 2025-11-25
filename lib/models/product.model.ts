import prisma from '../prisma';

export interface CreateProductDto {
    name: string;
}

export interface UpdateProductDto {
    name?: string;
}

export class ProductModel {
    /**
     * Get all products with their packages and batch numbers
     */
    static async findAll() {
        return await prisma.product.findMany({
            include: {
                packages: {
                    include: {
                        batchNumbers: true,
                    },
                },
                batchNumbers: {
                    include: {
                        package: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get product by ID with packages and batch numbers
     */
    static async findById(id: string) {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                packages: {
                    include: {
                        batchNumbers: true,
                    },
                },
                batchNumbers: {
                    include: {
                        package: true,
                    },
                },
            },
        });
    }

    /**
     * Get product by name
     */
    static async findByName(name: string) {
        return await prisma.product.findUnique({
            where: { name },
        });
    }

    /**
     * Create a new product
     */
    static async create(data: CreateProductDto) {
        return await prisma.product.create({
            data,
        });
    }

    /**
     * Update a product
     */
    static async update(id: string, data: UpdateProductDto) {
        return await prisma.product.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a product (cascades to packages and batch numbers)
     */
    static async delete(id: string) {
        return await prisma.product.delete({
            where: { id },
        });
    }
}
