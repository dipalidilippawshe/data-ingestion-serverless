"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const sqs = new client_sqs_1.SQSClient({ region: process.env.AWS_REGION });
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = JSON.parse(event.body || "{}");
        const params = {
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify(body),
        };
        yield sqs.send(new client_sqs_1.SendMessageCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Message sent to SQS!" }),
        };
    }
    catch (error) {
        console.error("Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to send message" }) };
    }
});
exports.handler = handler;
