import express from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

import User from "../../db/userModel.js";

const router = express.Router();

router.get("/hashtags", (req, res) => {
  User.find({}, "hashtags.hashtag hashtags.numberOfTimes")
    .then((users) => {
      const hashtags = users.reduce((acc, user) => {
        const userHashtags = user.hashtags;
        userHashtags.forEach((hashtag) => {
          const existingHashtag = acc.find(
            (h) => h.hashtag === hashtag.hashtag
          );
          if (existingHashtag) {
            existingHashtag.numberOfTimes += hashtag.numberOfTimes;
          } else {
            acc.push({
              hashtag: hashtag.hashtag,
              numberOfTimes: hashtag.numberOfTimes,
            });
          }
        });
        return acc;
      }, []);
      hashtags.sort((a, b) => b.numberOfTimes - a.numberOfTimes);
      res.status(200).send(hashtags);
    })
    .catch((error) => {
      res.status(500).send({
        message: "Error getting hashtags",
        error,
      });
    });
});

export default router;
