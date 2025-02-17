
import csv from "csv-parser";
import { Readable } from "stream";
import {sendMessage} from "./utils/sqs";
import {readFileFromS3} from "./utils/s3";
const filePath = "data.csv";
const bucketName = process.env.S3_BUCKET_NAME!;
const fileName = process.env.S3_FILE_NAME!;
export const handler= async(event :Event)=>{
   console.log("FIlepath: ",filePath);

    try {
    //Read file from s3
   
    const filedata= await readFileFromS3(bucketName,fileName)
    console.log("body: ",filedata); 
    if(filedata && filedata['Body']){
        console.log("bodu founjngf");

    
    const objectName = fileName; // The key you requested
    const contentType = filedata.ContentType || "Unknown"; 
    const contentLength = filedata.ContentLength || 0; 
    const fileSize= contentLength/ (1024 * 1024);
    if(contentType!=="text/csv"){
        console.error("Invalid file type. Expected CSV.");
        throw new Error("Invalid file type. Expected CSV.");
    }
    if(fileSize>10){
        console.error("Please upload file upto size of 10MB");
        throw new Error("Please upload file upto size of 10MB");

    }
    const fileContent = await parseCSV(filedata.Body as Readable);
    await Promise.all(fileContent.map((item: any) =>
        sendMessage(process.env.SQS_QUEUE_URL!,item)
    ))
    console.log("All messages sent successfully.");

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "CSV processed successfully", data: fileContent }),
      };
    }
   }catch(error){
    console.error("Error reading file:", error);
    return {
        statusCode: 401,
        body: JSON.stringify({ statusCode: 500, body: `Error: ${error}` })
       };
   }

}

const parseCSV = async (stream: Readable): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
  
      stream
        .pipe(csv()) // 🔹 Parse CSV stream
        .on("data", (data) => results.push(data)) // 🔹 Collect parsed data
        .on("end", () => resolve(results))
        .on("error", (err) => reject(err));
    });
  };