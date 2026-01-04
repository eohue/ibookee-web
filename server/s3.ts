import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Helper to check if S3 is configured
export const isS3Configured = () => {
    return !!(process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_BUCKET_NAME);
};

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function uploadToS3(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    if (!isS3Configured()) {
        throw new Error("AWS credentials are not configured");
    }

    const bucketName = process.env.AWS_BUCKET_NAME!;
    const region = process.env.AWS_REGION || "ap-northeast-2";
    const key = `uploads/${filename}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the public URL
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
