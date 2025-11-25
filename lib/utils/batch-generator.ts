/**
 * Batch Number Generator Utility
 * Generates batch numbers in format: [First 2 letters of product][Package name uppercase]
 * Example: "Pepper Powder" + "100mg" = "PE100MG"
 */

export function generateBatchNumber(productName: string, packageName: string): string {
    if (!productName || !packageName) {
        throw new Error('Product name and package name are required');
    }

    // Get first 2 letters of product name in uppercase
    const prefix = productName.substring(0, 2).toUpperCase();

    // Remove non-alphanumeric characters and convert to uppercase
    const suffix = packageName.toUpperCase().replace(/[^A-Z0-9]/g, '');

    return `${prefix}${suffix}`;
}

/**
 * Validate batch number format
 */
export function isValidBatchNumberFormat(batchNo: string): boolean {
    // Should be at least 3 characters (2 letter prefix + 1 char suffix)
    // Should only contain uppercase letters and numbers
    return /^[A-Z]{2}[A-Z0-9]+$/.test(batchNo);
}
