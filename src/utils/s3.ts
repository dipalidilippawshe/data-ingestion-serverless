import { S3, GetObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from "stream";
const s3 = new S3();
export const readFileFromS3 = async(bucket: string, key: string)=>{
  
       const file= await s3.send(new GetObjectCommand({
            Bucket: bucket, Key: key
        }))
        return file;
    
};
 
export const uploadFile = async (params:any) => {
  try{
    await s3.putObject({
      Bucket: params.Bucket,
      Key: params.Key,
      Body: params.Body,
      ContentType:params.contentType
    })
  }catch(error){
    console.log("upload error:", error);
  }
 
};
