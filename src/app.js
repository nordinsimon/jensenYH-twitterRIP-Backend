import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";

import { dbConnect } from "../db/dbConnect.js";

import userRoutes from "./routes/user.js";
import tweetRoutes from "./routes/tweets.js";
import hashtagRoutes from "./routes/hashtags.js";
import searchRoutes from "./routes/search.js";

dbConnect();

// Konfiguration
const app = express();

// Middleware
const logger = (req, res, next) => {
  console.log(`${req.method}  ${req.url}`, req.body);
  console.log("Headers", req.headers.authorization);
  next();
};

app.use(fileUpload({ createParentPath: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(logger);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Routes
app.use("/user", userRoutes);
app.use("/tweets", tweetRoutes);
app.use("/trending", hashtagRoutes);
app.use("/search", searchRoutes);

export { app };
