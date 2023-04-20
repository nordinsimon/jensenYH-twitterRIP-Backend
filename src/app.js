import express from "express";
import { dbConnect } from "../db/dbConnect.js";

import userRoutes from "./routes/user.js";

dbConnect();

// Konfiguration
const app = express();

// Middleware
const logger = (req, res, next) => {
  console.log(`${req.method}  ${req.url}`, req.body);
  next();
};

app.use(express.json());
app.use(logger);

// Routes
app.use("/user", userRoutes);

export { app };
