import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: {
    firstName: {
      type: String,
      required: true,
      minlength: [3, "First name must be at least of 3 characters"],
    },
    lastName: {
      type: String,
      minlength: [3, "Last name must be at least of 3 characters"], // Fixed typo: mminlength -> minlength
    },
  },
  email: String,
  password: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false },
  phone: String,
});

export const UserModel = mongoose.model("user", UserSchema);
