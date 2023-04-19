import express from "express";

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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export { app };
