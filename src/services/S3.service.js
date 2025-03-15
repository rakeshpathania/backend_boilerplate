import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIError } from "../utils/error-handler.js";

class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async generatePresignedUrl(bucketName, objectKey, expirationSeconds = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: expirationSeconds,
      });
      return url;
    } catch (error) {
      throw new APIError("Unable to generate the url", {
        message: error?.message,
        stack: error?.details?.stack,
      });
    }
  }

  async generatePresignedPutUrl(
    bucketName,
    objectKey,
    contentType,
    expirationSeconds = 3600
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: expirationSeconds,
      });
      return url;
    } catch (error) {
      throw new APIError("Unable to generate the url", {
        message: error?.message,
        stack: error?.details?.stack,
      });
    }
  }

  async uploadFile(bucketName, objectKey, fileBuffer, contentType) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: "private", // Set to "public-read" if the file should be publicly accessible
      });
      return await this.s3Client.send(command);
    } catch (error) {
      throw new APIError("Unable to upload the pic", {
        message: error?.message,
        stack: error?.details?.stack,
      });
    }
  }

  async deleteFile(bucketName, objectKey) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      return await this.s3Client.send(command);
    } catch (error) {
      throw new Error("Unable to delete the file", error);
    }
  }
}

export default S3Service;
