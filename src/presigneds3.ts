import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: "us-east-1" });

export async function generatePresignedUrl() {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: "data.csv", // Change the file name dynamically if needed
    ContentType: "csv", // Adjust the content type
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 
  console.log("Pre-signed URL:", url);
}

generatePresignedUrl();
