import serverless from "serverless-http";
import { app } from "./index.js";
export const server = serverless(app);
