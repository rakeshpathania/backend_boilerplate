import mongoose from "mongoose";

const blacklistedTokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, //24 houres in seconds
  },
});

export const BlacklistTokenModel = mongoose.model(
  "BlacklistToken",
  blacklistedTokenSchema
);
