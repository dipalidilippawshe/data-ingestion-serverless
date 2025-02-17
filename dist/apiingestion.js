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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const axios_1 = __importDefault(require("axios"));
const sqs_1 = require("./utils/sqs");
const logger_1 = __importDefault(require("./utils/logger"));
const sqs = new client_sqs_1.SQS();
const API_URL = "https://jsonplaceholder.typicode.com/todos"; // demo api that restuns json
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In api ingestion;;;");
    let page = 1;
    const limit = 10;
    let totalRecords = [];
    try {
        while (true) {
            try {
                const response = yield axios_1.default.get(`${API_URL}?_limit=${limit}&_page=${page}`);
                logger_1.default.info("Ingestion process started", { event });
                if (response.status !== 200 || response.data.length === 0) {
                    logger_1.default.info("No more data. Stopping ingestion.", { status: "failed" });
                    break;
                }
                // Sending all messages to SQS in parallel
                yield Promise.all(response.data.map((item) => (0, sqs_1.sendMessage)(process.env.SQS_QUEUE_URL, item)));
                totalRecords = totalRecords.concat(response.data);
                logger_1.default.info("Processing data", { data: event });
                page++; // Move to next page
            }
            catch (error) {
                logger_1.default.info("Error while fetching form Url: ", { status: "failed", error: error });
                throw new Error(`Error when fetching URL ${error}`);
            }
        }
        logger_1.default.info("Ingestion successful", { status: "success" });
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Data ingestion completed successfully",
                totalRecords,
            }),
        };
    }
    catch (error) {
        logger_1.default.error("Ingestion failed", { error });
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error during ingestion",
                error: error,
            }),
        };
    }
});
exports.handler = handler;
