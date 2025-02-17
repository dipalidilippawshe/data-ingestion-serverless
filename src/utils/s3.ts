import { S3, GetObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from "stream";
const s3 = new S3();
export const readFileFromS3 = async(bucket: string, key: string)=>{
  
       const file= await s3.send(new GetObjectCommand({
            Bucket: bucket, Key: key
        }))
        return file;
    
};
 
export const uploadFile = async (bucket: string, key: string, data: Buffer) => {
  await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: data,
  })
};
