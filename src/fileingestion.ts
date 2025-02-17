import * as fs from 'fs';
import path from "path";
import csv from "csv-parser";
import {sendMessage} from "./utils/sqs";
const filePath = "data.csv";
export const handler= async(event :Event)=>{
   console.log("FIlepath: ",filePath);

    try {
    
        if(!fs.existsSync(filePath)){
            console.log("File not found!");
            throw new Error("File not found!");
        }
        //file extension
        const fileExt = path.extname(filePath).toLowerCase();
        console.log("fileExt: ", fileExt);
        if(fileExt!==".csv"){
            console.error("Invalid file type. Expected CSV.");
            throw new Error("Invalid file type. Expected CSV.");
        }
    
        //get file sync
        const fileStats = fs.statSync(filePath);
        const fileSizeInMB = fileStats.size / (1024 * 1024); // Convert bytes to MB
        if(fileSizeInMB>10){
            console.error("Please upload file upto size of 10MB");
            throw new Error("Please upload file upto size of 10MB");
    
        }
        const stream = fs.createReadStream(filePath);
            const results: any[] = [];

            await new Promise((resolve, reject) => {
            stream.pipe(csv())
            .on("data", (data) => results.push(data)) // Push each row to array
            .on("end", () => resolve(results)) // Resolve promise when done
            .on("error", (error) => reject(error)); 
            });
            await Promise.all(results.map((item: any) =>
                sendMessage(process.env.SQS_QUEUE_URL!,item)
            ))
            console.log("All messages sent successfully.");

            return {
                statusCode: 201,
                body: JSON.stringify({ message: "CSV processed successfully", data: results }),
            };
 
   }catch(error){
    console.error("Error reading file:", error);
    return {
        statusCode: 401,
        body: JSON.stringify({ statusCode: 500, body: `Error: ${error}` })
       };
   }

}

