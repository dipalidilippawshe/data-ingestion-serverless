import { DynamoDBClient, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' }); 
const DB_TABLE:string = "user";
export const batchWrite = async(writedata:[])=> {
   return new Promise(async(resolve,reject)=>{
        //Write data in dynamo data into batches..
       
        const params = {
            RequestItems: {
                [DB_TABLE] : writedata,
            },
          };
          console.log("DB_TABLE: ",params)
          try{
            const command = new BatchWriteItemCommand(params);
            const response = await dynamoDbClient.send(command);
            resolve(response);
          }catch(error){
            reject(error);
          }
          
  
   })
}