import express from "express";

import decodeToken from "../decodeToken.js";
import User from "../../db/userModel.js";

const router = express.Router();
router.get("/fromUser", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const { nickname } = req.body;
  User.findOne({ nickname: nickname })
    .then((user) => {
      console.log("User", user);
      const userObj = user.toObject();
      let nickname = userObj.nickname;
      let tweets = userObj.tweets;
      res.status(200).send({
        message: "User Found",
        nickname,
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
  const nickname = decoded.nickname;

  let hashIndex = tweet.indexOf("#");
  let hashtag = "";
  if (hashIndex !== -1) {
    let spaceIndex = tweet.indexOf(" ", hashIndex);
    hashtag = tweet.substring(hashIndex, spaceIndex);
  }

  User.findOne({ nickname: nickname })
    .then((user) => {
      user.tweets.push({ tweet: tweet, likes: [] });

      const userHashtags = user.hashtags;
      const existingHashtag = userHashtags.find((h) => h.hashtag === hashtag);
      if (existingHashtag) {
        existingHashtag.numberOfTimes++;
      } else {
        user.hashtags.push({ hashtag: hashtag, numberOfTimes: 1 });
      }
      console.log("User", user);
      user
        .save()
        .then((result) => {
          let nickname = result.nickname;
          let tweets = result.tweets;
          res.status(201).send({
            message: "Tweet Created Successfully",
            nickname,
            tweets,
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
  const nicknameLiker = decoded.nickname;
  const { tweetId, nickname } = req.body;

  User.findOne({ nickname: nickname }).then((user) => {
    console.log("User", user);
    try {
      const userObj = user.toObject();
      let tweets = userObj.tweets;
      let tweet = tweets.find((tweet) => tweet._id == tweetId);
      if (tweet.likes.find((like) => like.nickname == nicknameLiker)) {
        res.status(400).send({
          message: "Tweet already liked",
        });
        return;
      } else {
        let index = tweets.indexOf(tweet);
        tweet.likes.push(nicknameLiker);
        user.tweets[index].likes.push({ nickname: nicknameLiker });
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
