import express from "express";

import decodeToken from "../decodeToken.js";
import User from "../../db/userModel.js";

const router = express.Router();

router.post("/hashtag", (req, res) => {
  console.log("Adding hashtag");
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const { hashtag } = req.body;
  User.findOne({ nickname: decoded.nickname })
    .then((user) => {
      const userHashtags = user.hashtags;
      const existingHashtag = userHashtags.find((h) => h.hashtag === hashtag);
      if (existingHashtag) {
        existingHashtag.numberOfTimes++;
      } else {
        user.hashtags.push({ hashtag: hashtag, numberOfTimes: 1 });
      }
      user

        .save()
        .then((result) => {
          res.status(201).send({
            message: "Hashtag Created Successfully",
            result,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Error creating hashtag",
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
});

router.get("/hashtags", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
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
