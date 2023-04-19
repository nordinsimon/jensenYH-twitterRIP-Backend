import express from "express";
import * as url from "url";

// Konfiguration
const app = express();

const staticPath = url.fileURLToPath(new URL("../static", import.meta.url));

// Middleware
const logger = (req, res, next) => {
  console.log(`${req.method}  ${req.url}`, req.body);
  next();
};

app.use(express.json());
app.use(logger);
app.use(express.static(staticPath));

// Routes

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
