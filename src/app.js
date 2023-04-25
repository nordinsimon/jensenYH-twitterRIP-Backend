import express from "express";
import cors from "cors";
import { dbConnect } from "../db/dbConnect.js";

import userRoutes from "./routes/user.js";
import tweetRoutes from "./routes/tweets.js";

dbConnect();

// Konfiguration
const app = express();

// Middleware
const logger = (req, res, next) => {
  console.log(`${req.method}  ${req.url}`, req.body);
  console.log("Headers", req.headers.authorization);
  next();
};

app.use(cors());
app.use(express.json());
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

export { app };
