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
export default router;
