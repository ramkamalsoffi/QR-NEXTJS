import prisma from '../prisma';

export interface CreateCustomerDto {
    customerId: string;
    email: string;
    batchNoId: string;
    ipAddress: string;
    device?: string;
    os?: string;
    location?: string;
    browser?: string;
}

export interface UpdateCustomerDto {
    email?: string;
}

export class CustomerModel {
    /**
     * Get all customers with batch number details
     */
    static async findAll() {
        return await prisma.customer.findMany({
            include: {
                batchNumber: {
                    include: {
                        product: true,
                        package: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }

    /**
     * Get customer by ID
     */
    static async findById(id: string) {
        return await prisma.customer.findUnique({
            where: { id },
            include: {
                batchNumber: {
                    include: {
                        product: true,
                        package: true,
                    },
                },
            },
        });
    }

    /**
     * Get customers by batch number ID
     */
    static async findByBatchNoId(batchNoId: string) {
        return await prisma.customer.findMany({
            where: { batchNoId },
            include: {
                batchNumber: {
                    include: {
                        product: true,
                        package: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }

    /**
     * Get customers by email
     */
    static async findByEmail(email: string) {
        return await prisma.customer.findMany({
            where: { email },
            include: {
                batchNumber: {
                    include: {
                        product: true,
                        package: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }

    /**
     * Get unique customers (grouped by customerId)
     */
    static async findUniqueCustomers() {
        const customers = await prisma.customer.groupBy({
            by: ['customerId', 'email'],
            _count: {
                id: true,
            },
            _max: {
                submittedAt: true,
            },
            orderBy: {
                _max: {
                    submittedAt: 'desc',
                },
            },
        });
        return customers;
    }

    /**
     * Get all submissions for a specific customer by customerId
     */
    static async findByCustomerId(customerId: string) {
        return await prisma.customer.findMany({
            where: { customerId },
            include: {
                batchNumber: {
                    include: {
                        product: true,
                        package: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
    }

    /**
     * Create a new customer
     */
    static async create(data: CreateCustomerDto) {
        return await prisma.customer.create({
            data,
            include: {
                batchNumber: {
                    include: {
                        product: true,
                        package: true,
                    },
                },
            },
        });
    }

    /**
     * Update a customer
     */
    static async update(id: string, data: UpdateCustomerDto) {
        return await prisma.customer.update({
            where: { id },
            data,
            include: {
                batchNumber: {
                    include: {
                        product: true,
                        package: true,
                    },
                },
            },
        });
    }

    /**
     * Delete a customer
     */
    static async delete(id: string) {
        return await prisma.customer.delete({
            where: { id },
        });
    }
}
