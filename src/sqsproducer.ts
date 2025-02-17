import { APIGatewayEvent, Context } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION });

export const handler = async (event: APIGatewayEvent, context: Context) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify(body),
    };

    await sqs.send(new SendMessageCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent to SQS!" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send message" }) };
  }
};
