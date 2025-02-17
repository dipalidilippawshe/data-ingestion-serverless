"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const sqs_1 = require("./utils/sqs");
const filePath = "data.csv";
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("FIlepath: ", filePath);
    try {
        if (!fs.existsSync(filePath)) {
            console.log("File not found!");
            throw new Error("File not found!");
        }
        //file extension
        const fileExt = path_1.default.extname(filePath).toLowerCase();
        console.log("fileExt: ", fileExt);
        if (fileExt !== ".csv") {
            console.error("Invalid file type. Expected CSV.");
            throw new Error("Invalid file type. Expected CSV.");
        }
        //get file sync
        const fileStats = fs.statSync(filePath);
        const fileSizeInMB = fileStats.size / (1024 * 1024); // Convert bytes to MB
        if (fileSizeInMB > 10) {
            console.error("Please upload file upto size of 10MB");
            throw new Error("Please upload file upto size of 10MB");
        }
        const stream = fs.createReadStream(filePath);
        const results = [];
        yield new Promise((resolve, reject) => {
            stream.pipe((0, csv_parser_1.default)())
                .on("data", (data) => results.push(data)) // Push each row to array
                .on("end", () => resolve(results)) // Resolve promise when done
                .on("error", (error) => reject(error));
        });
        yield Promise.all(results.map((item) => (0, sqs_1.sendMessage)(process.env.SQS_QUEUE_URL, item)));
        console.log("All messages sent successfully.");
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "CSV processed successfully", data: results }),
        };
    }
    catch (error) {
        console.error("Error reading file:", error);
        return {
            statusCode: 401,
            body: JSON.stringify({ statusCode: 500, body: `Error: ${error}` })
        };
    }
});
exports.handler = handler;
