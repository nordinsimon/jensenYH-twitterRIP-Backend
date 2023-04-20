import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

import { dbConnect } from "../db/dbConnect.js";
import User from "../db/userModel.js";

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

app.post("/register", (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        email: req.body.email,
        password: hashedPassword,
      });
      user
        .save()
        .then((result) => {
          res.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    .catch((e) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

app.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })

    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordCheck) => {
          if (!passwordCheck) {
            return res.status(401).send({
              message: "Password is incorrect",
            });
          }
          const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          res.status(200).send({
            message: "Login successful",
            email: user.email,
            token,
          });
        })
        .catch((e) => {
          res.status(401).send({
            message: "Password is incorrect",
            e,
          });
        });
    })
    .catch((e) => {
      res.status(404).send({
        message: "User not found",
        e,
      });
    });
});

export { app };
