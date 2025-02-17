import { SQS } from "@aws-sdk/client-sqs"

const sqs = new SQS();

export const sendMessage = async (queueUrl: string, message: object) => {

    try{
        const response = await sqs.sendMessage({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
          })
      
          return response;
    }catch(e){
        console.error("Failed to send message to SQS:", e);
        throw e;
    }
  
};
