import express from "express";
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

app.use(express.json());
app.use(logger);

// Routes
app.use("/user", userRoutes);
app.use("/tweets", tweetRoutes);

export { app };
