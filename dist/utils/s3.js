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
exports.uploadFile = exports.readFileFromS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3();
const readFileFromS3 = (bucket, key) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield s3.send(new client_s3_1.GetObjectCommand({
        Bucket: bucket, Key: key
    }));
    return file;
});
exports.readFileFromS3 = readFileFromS3;
const uploadFile = (bucket, key, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: data,
    });
});
exports.uploadFile = uploadFile;
