import { DynamoDBClient, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import {batchWrite} from "./utils/dynamodb";
const dynamoDbClient = new DynamoDBClient({});
const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME!;
const batch_size=25;
let unprocessedItems:any[] = [];
export const handler = async(event:any)=>{
    try{
      
     // const parsedBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
          
        for(const record of event.Records){
         console.log("event.records: ", record);
            const chunk = JSON.parse(record.body);
            const batches=[];
            for (let i = 0; i < chunk.length; i += batch_size) {
              batches.push(chunk.slice(i, i + batch_size));
            }
            for (const batch of batches) {
             
              // Prepare write requests for DynamoDB
              const writeRequests = batch.map((item: any) => {
                console.log("item here:", item);
                const putRequest = {
                  PutRequest: {
                  Item: {
                    id:{N:String(item.id)},
                    userId:{ N: String(item.userId) },
                    title:{S:item.title},
                    completed:{BOOL:item.completed}
                  }
                }
              }
                console.log("item here after:", putRequest);
                return putRequest;
              });
              console.log("DIRECTLY OUT OF MAP:",writeRequests);
              const response:any = await batchWrite(writeRequests);
              if(response.unprocessedItems && Object.keys(response.UnprocessedItems).length > 0){
                unprocessedItems = unprocessedItems.concat(response.unprocessedItems)
              }
            } 
              return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Data processed and stored in DynamoDB' }),
              };

 

           

        }
    }catch(error){
        console.error('Error processing data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to process data', error: error }),
    };
  }
}
