import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

// Check configuration
export const isS3Configured = () => {
    return !!(process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_BUCKET_NAME);
};

export const isSupabaseStorageConfigured = () => {
    // Check for Supabase URL and Key (Service Role Key recommended for storage upload)
    // If DATABASE_URL is set, we assume Supabase DB is used, but Storage needs URL/Key.
    // Vercel integration usually provides NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
    // or SUPABASE_SERVICE_ROLE_KEY.
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
};

// Initialize S3 Client
let s3Client: S3Client | null = null;
if (isS3Configured()) {
    s3Client = new S3Client({
        region: process.env.AWS_REGION || "ap-northeast-2",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
    });
}

// Initialize Supabase Client
let supabaseClient: any = null;
if (isSupabaseStorageConfigured()) {
    supabaseClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function uploadToStorage(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    // 1. Try S3 first
    if (isS3Configured() && s3Client) {
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
        return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    }

    // 2. Try Supabase Storage
    if (isSupabaseStorageConfigured() && supabaseClient) {
        const bucketName = 'uploads'; // Default bucket name
        // Ensure filename is clean
        const filePath = `${filename}`;

        const { data, error } = await supabaseClient
            .storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType: contentType,
                upsert: true
            });

        if (error) {
            console.error("Supabase Storage Upload Error:", error);
            throw new Error(`Supabase Storage upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabaseClient
            .storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    }

    throw new Error("No storage provider configured (S3 or Supabase). Files cannot be persisted.");
}

export const isStorageConfigured = () => isS3Configured() || isSupabaseStorageConfigured();
