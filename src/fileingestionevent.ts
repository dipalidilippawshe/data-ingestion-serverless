import { S3, GetObjectCommand } from "@aws-sdk/client-s3"
import express, { Request, Response } from "express";
import multer from "multer";
import awsServerlessExpress from "aws-serverless-express";
const bucketName = process.env.S3_BUCKET_NAME!;
import {uploadFile} from "./utils/s3";
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json({ limit: '50mb' }));
app.post("/upload", upload.single("file"), async (req: Request, res: Response):Promise<void> => {
    try {
      if (!req.file) {
         res.status(400).json({ message: "No file uploaded" });
         return;
      }
  
      console.log("File Received:", req.file.originalname , "and :, ", bucketName);
  
      // Upload file to S3
      const params = {
        Bucket: bucketName,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };
      console.log("params", params );

  
      await uploadFile(params)
  
      res.status(200).json({ message: "File uploaded successfully", fileName: req.file.originalname });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed", error });
    }
  });
  
  // Wrap Express app with aws-serverless-express
  const server = awsServerlessExpress.createServer(app);
  
  // Lambda handler function
  export const uploadFileHandler = (event: any, context: any) => {
    return awsServerlessExpress.proxy(server, event, context);
  };