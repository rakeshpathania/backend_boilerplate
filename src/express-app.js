import express from "express";
import cors from "cors";
import { AuthenticationController } from "./controllers/authentication.js";
import { handleError } from "./utils/error-handler.js";
import { HandleMultimediaController } from "./controllers/handle-multimedia.js";

export default async (app) => {
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cors());

  //testing route
  app.get("/", (req, res, next) => {
    return res.status(200).json({
      message: "API is working",
    });
  });

  //api
  AuthenticationController(app);
  HandleMultimediaController(app);

  // error handling
  app.use(handleError);
};
