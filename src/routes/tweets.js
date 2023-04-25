import express from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

import User from "../../db/userModel.js";

const router = express.Router();

router.post("/tweet", (req, res) => {
  console.log("Tweet", req.body);
  const { tweet } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded", decoded);

    const demail = decoded.email;
    console.log("Email", demail);
    User.findOne({ email: demail })

      .then((user) => {
        user.tweets.push({ tweet: tweet, likes: [] });
        console.log("User", user);
        user
          .save()
          .then((result) => {
            res.status(201).send({
              message: "Tweet Created Successfully",
              result,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: "Error creating tweet",
              error,
            });
          });
      })
      .catch((e) => {
        res.status(500).send({
          message: "Error finding user",
          e,
        });
      });
  } catch (e) {
    console.log("Unauthorized");
    res.status(401).send({
      message: "You are not authorized",
      e,
    });
  }
});
export default router;
