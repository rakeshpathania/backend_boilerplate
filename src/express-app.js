import express from "express";
import cors from "cors";
import { AuthenticationController } from "./controllers/authentication.js";
import { handleError } from "./utils/error-handler.js";

export default async (app) => {
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cors());

  //api
  AuthenticationController(app);

  // error handling
  app.use(handleError);
};
