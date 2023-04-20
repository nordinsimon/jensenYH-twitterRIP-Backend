import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();
const DB_URL = process.env.DB_URL;
async function dbConnect() {
  mongoose
    .connect(DB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.log("Unable to connect to MongoDB");
      console.error(err);
    });
}

export { dbConnect };
