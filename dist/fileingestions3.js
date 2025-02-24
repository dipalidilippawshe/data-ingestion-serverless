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
const csv_parser_1 = __importDefault(require("csv-parser"));
const lambda_multipart_parser_1 = __importDefault(require("lambda-multipart-parser"));
const s3_1 = require("./utils/s3");
const filePath = "data.csv";
const bucketName = process.env.S3_BUCKET_NAME;
const fileName = process.env.S3_FILE_NAME;
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = yield lambda_multipart_parser_1.default.parse(event);
        const file = parsedData.files[0];
        if (!file) {
            return {
                statusCode: 404,
                body: JSON.stringify("file not found!")
            };
        }
        const s3Object = {
            Bucket: bucketName,
            Key: file.filename,
            Body: file.content,
            ContentType: file.contentType
        };
        const savedPromise = yield (0, s3_1.putObjecttos3)(s3Object);
        return {
            statusCode: 201,
            body: JSON.stringify(savedPromise)
        };
    }
    catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify(error)
        };
    }
    /**
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
 */
});
exports.handler = handler;
const parseCSV = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const results = [];
        stream
            .pipe((0, csv_parser_1.default)()) // 🔹 Parse CSV stream
            .on("data", (data) => results.push(data)) // 🔹 Collect parsed data
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
});
