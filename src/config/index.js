import dotenv from "dotenv";

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  console.log("configFile", configFile);
  dotenv.config({ path: configFile });
} else {
  dotenv.config();
}

export const PORT = process.env.PORT;
export const DB_URL = process.env.MONGODB_URI;
export const APP_SECRET = process.env.APP_SECRET;
