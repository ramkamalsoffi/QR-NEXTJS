import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export interface UploadResult {
    Location: string;
    Key: string;
    Bucket: string;
}

export class S3UploadService {
    private static getClient() {
        const region = process.env.NEW_REGION || 'us-east-1';

        // Determine the correct endpoint
        let endpoint = process.env.S3_ENDPOINT;

        // If no custom endpoint is set, check if it's DigitalOcean Spaces
        if (!endpoint && (region.includes('digitalocean') || ['nyc3', 'sfo3', 'sgp1', 'blr1', 'fra1', 'ams3'].includes(region))) {
            endpoint = `https://${region}.digitaloceanspaces.com`;
        }

        return new S3Client({
            region,
            credentials: {
                accessKeyId: process.env.NEW_ACCESS_KEY || '',
                secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
            },
            endpoint,
            forcePathStyle: false,
        });
    }

    static async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
        const client = this.getClient();
        const bucketName = process.env.BUCKET_NAME || '';
        const key = `reports/${Date.now()}-${fileName}`;

        const upload = new Upload({
            client,
            params: {
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                ACL: 'public-read',
            },
        });

        await upload.done();

        // Construct URL
        let Location: string;
        const region = process.env.NEW_REGION || 'us-east-1';

        if (process.env.S3_ENDPOINT) {
            // Custom S3 endpoint provided
            const endpointUrl = process.env.S3_ENDPOINT.replace('https://', '').replace('http://', '');
            Location = `https://${bucketName}.${endpointUrl}/${key}`;
        } else if (region.includes('digitalocean') || ['nyc3', 'sfo3', 'sgp1', 'blr1', 'fra1', 'ams3'].includes(region)) {
            // DigitalOcean Spaces
            Location = `https://${bucketName}.${region}.digitaloceanspaces.com/${key}`;
        } else {
            // AWS S3
            Location = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
        }

        return {
            Location,
            Key: key,
            Bucket: bucketName,
        };
    }

    static async deleteFile(key: string): Promise<boolean> {
        try {
            const client = this.getClient();
            const bucketName = process.env.BUCKET_NAME || '';

            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            await client.send(command);
            return true;
        } catch (error) {
            console.error('S3 Delete Error:', error);
            return false;
        }
    }
}
