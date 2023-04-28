import express from "express";

import decodeToken from "../decodeToken.js";
import User from "../../db/userModel.js";

const router = express.Router();
router.get("/fromUser", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const { email } = req.body;
  console.log("Email", email);
  User.findOne({ email: email })
    .then((user) => {
      console.log("User", user);
      const userObj = user.toObject();
      let tweets = userObj.tweets;
      res.status(200).send({
        message: "User Found",
        tweets,
      });
    })
    .catch((e) => {
      res.status(500).send({
        message: "Error finding user",
        e,
      });
    });
});

router.post("/tweet", (req, res) => {
  const { tweet } = req.body;
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  console.log("decoded", decoded);
  const email = decoded.email;
  console.log("Email", email);
  User.findOne({ email: email })

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
});

router.post("/like", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const emailLiker = decoded.email;
  const { tweetId, email } = req.body;

  User.findOne({ email: email }).then((user) => {
    console.log("User", user);
    try {
      const userObj = user.toObject();
      let tweets = userObj.tweets;
      let tweet = tweets.find((tweet) => tweet._id == tweetId);
      if (tweet.likes.find((like) => like.user == emailLiker)) {
        res.status(400).send({
          message: "Tweet already liked",
        });
        return;
      } else {
        let index = tweets.indexOf(tweet);
        tweet.likes.push(emailLiker);
        user.tweets[index].likes.push({ user: emailLiker });
        user
          .save()
          .then((result) => {
            res.status(201).send({
              message: "Tweet Liked Successfully",
              result,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: "Error liking tweet",
              error,
            });
          });
      }
    } catch (e) {
      res.status(404).send({
        message: "User or tweet not found",
        e,
      });
    }
  });
});

export default router;
