import express from "express";

import decodeToken from "../decodeToken.js";
import User from "../../db/userModel.js";

const router = express.Router();

router.get("/", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const allUsers = [];
  const allhashtags = [];
  User.find()
    .then((users) => {
      users.forEach((user) => {
        allUsers.push(user.nickname);
        user.hashtags.forEach((hashtag) => {
          if (!allhashtags.includes(hashtag.hashtag)) {
            allhashtags.push(hashtag.hashtag);
          }
        });
      });
      res.status(200).send({
        message: "Users and hashtags found",
        allUsers,
        allhashtags,
      });
    })
    .catch((e) => {
      res.status(500).send({
        message: "Error finding users",
        e,
      });
    });

  console.log("allUsers", allUsers);
});

export default router;
