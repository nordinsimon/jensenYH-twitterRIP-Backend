import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
  nickname: {
    type: String,
    required: [true, "Please provide a nickname"],
    unique: [true, "Nickname already exists"],
  },
  about: {
    type: String,
    required: [true, "Please provide a description"],
    unique: false,
  },
  employment: {
    type: String,
    required: [true, "Please provide your employment"],
    unique: false,
  },
  hometown: {
    type: String,
    required: [true, "Please provide your hometown"],
    unique: false,
  },
  webbpage: {
    type: String,
    required: [true, "Please provide your webbpage"],
    unique: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
