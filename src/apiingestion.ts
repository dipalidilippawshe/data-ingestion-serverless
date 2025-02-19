import { SQS, SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import axios from "axios";
import {sendMessage} from "./utils/sqs";
import logger from "./utils/logger";
const sqs = new SQS();
const API_URL = "https://jsonplaceholder.typicode.com/todos"; // demo api that restuns json

export const handler=async(event:any)=>{
    console.log("In api ingestion;;;");
    let page=1;
    const limit =100;
    let totalRecords:any[]=[];
    try{
        while(true){
            try{
             
               const response = await axios.get(`${API_URL}?_limit=${limit}&_page=${page}`);
               logger.info("Ingestion process started", { event });
                if (response.status !== 200 || response.data.length === 0) {
                
                   logger.info("No more data. Stopping ingestion.", { status: "failed" });
                   break;
                }
                  sendMessage(process.env.SQS_QUEUE_URL!,response.data)
                   // Sending all messages to SQS in parallel
                //    await Promise.all(response.data.map((item: any) =>
                //    sendMessage(process.env.SQS_QUEUE_URL!,item)
                //  ));
                   console.log("after data post..");
                   totalRecords = totalRecords.concat(response.data);
                   logger.info("Processing data", { data: event });
                page++; // Move to next page
            }catch(error){
                   logger.info("Error while fetching form Url: ", { status: "failed" ,error:error});
                   throw new Error(`Error when fetching URL ${error}`)
               }
           }
           logger.info("Ingestion successful", { status: "success" });
           return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Data ingestion completed successfully",
                totalRecords,
            }),
        };
    }catch(error){
        logger.error("Ingestion failed", { error });
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error during ingestion",
                error: error,
            }),
        };
    }
   
   
}