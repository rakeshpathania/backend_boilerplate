import S3Service from "../services/S3.service.js";
import multer from "multer";
import Authenticate from "../middlewares/auth.js";
import { STATUS_CODES, SUCCESS_STATUS } from "../utils/error-handler.js";

export const HandleMultimediaController = (app) => {
  const s3Service = new S3Service();
  // File type validation
  const fileFilter = (req, file, cb) => {
    // Accept only image mimetypes
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedMimeTypes?.includes(file?.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF and WEBP images are allowed."
        ),
        false
      );
    }
  };

  // Multer configuration
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB in bytes
      files: 1, // Allow only 1 file per request
    },
    fileFilter: fileFilter,
  });

  app.post(
    "/multimedia/upload-pic",
    Authenticate,
    upload.single("image"),
    async (req, res, next) => {
      try {
        const image = req.file;
        const bucketName = process.env.AWS_BUCKET_NAME;
        const fileName = `${Date.now()}-${image.originalname}`;
        const contentType = image?.mimetype;
        const buffer = image?.buffer;
        await s3Service.uploadFile(bucketName, fileName, buffer, contentType);
        return res
          .status(STATUS_CODES.OK)
          .json(SUCCESS_STATUS("File uploaded successfully"));
      } catch (err) {
        return next(err);
      }
    }
  );

  app.get(
    "/multimedia/get-pic/:fileName",
    Authenticate,
    async (req, res, next) => {
      try {
        const bucketName = process.env.AWS_BUCKET_NAME;
        const { fileName } = req.params;
        const presignedUrl = await s3Service.generatePresignedUrl(
          bucketName,
          fileName
        );
        return res
          .status(STATUS_CODES.OK)
          .json(SUCCESS_STATUS("Image fetched successfully", presignedUrl));
      } catch (err) {
        return next(err);
      }
    }
  );

  app.put(
    "/multimedia/update-pic/:fileName",
    Authenticate,
    upload.single("image"),
    async (req, res, next) => {
      try {
        const image = req.file;
        const bucketName = process.env.AWS_BUCKET_NAME;
        const { fileName } = req.params;
        const contentType = image?.mimetype;
        const buffer = image?.buffer;
        await s3Service.uploadFile(bucketName, fileName, buffer, contentType);
        return res
          .status(STATUS_CODES.OK)
          .json(SUCCESS_STATUS("File updated successfully"));
      } catch (err) {
        return next(err);
      }
    }
  );

  app.delete(
    "/multimedia/delete-pic/:fileName",
    Authenticate,
    async (req, res, next) => {
      try {
        const bucketName = process.env.AWS_BUCKET_NAME;
        const { fileName } = req.params;
        await s3Service.deleteFile(bucketName, fileName);
        return res
          .status(STATUS_CODES.OK)
          .json(SUCCESS_STATUS("File deleted successfully"));
      } catch (err) {
        return next(err);
      }
    }
  );
};
