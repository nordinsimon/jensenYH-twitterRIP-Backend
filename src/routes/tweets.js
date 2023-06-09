import express from "express";

import decodeToken from "../decodeToken.js";
import User from "../../db/userModel.js";

const router = express.Router();
router.get("/fromUser/:nickname", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const { nickname } = req.params;
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

router.get("/feed", async (req, res) => {
  console.log("INNE I FEED");
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const nickname = decoded.nickname;

  try {
    const currentUser = await User.findOne({ nickname: nickname });
    const allTweets = [...currentUser.tweets];
    const following = currentUser.following;

    const promises = following.map(async (user) => {
      const nickname = user.toObject().followed;
      console.log("nickname", nickname);

      const followingUser = await User.findOne({ nickname: nickname });
      allTweets.push(...followingUser.tweets);
    });

    await Promise.all(promises);
    console.log("Sorting tweets");
    allTweets.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    console.log("SENDSTATUS");
    res.status(200).send({
      message: "Feed Found",
      allTweets,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: "Error finding user",
      e,
    });
  }
});

router.post("/tweet", (req, res) => {
  const { tweet } = req.body;
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const nickname = decoded.nickname;

  let hashtags = [];
  let hashIndex = tweet.indexOf("#");
  while (hashIndex !== -1) {
    let spaceIndex = tweet.indexOf(" ", hashIndex);
    if (spaceIndex === -1) {
      spaceIndex = tweet.length;
    }
    hashtags.push(tweet.substring(hashIndex, spaceIndex));
    hashIndex = tweet.indexOf("#", spaceIndex);
  }

  User.findOne({ nickname: nickname })
    .then((user) => {
      user.tweets.push({ tweet: tweet, nickname: nickname, likes: [] });

      const userHashtags = user.hashtags;
      hashtags.forEach((hashtag) => {
        const existingHashtag = userHashtags.find((h) => h.hashtag === hashtag);
        if (existingHashtag) {
          existingHashtag.numberOfTimes++;
        } else {
          user.hashtags.push({ hashtag: hashtag, numberOfTimes: 1 });
        }
      });
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
