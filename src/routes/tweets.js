import express from "express";

import decodeToken from "../decodeToken.js";
import User from "../../db/userModel.js";

const router = express.Router();
router.get("/", (req, res) => {});

router.post("/tweet", async (req, res) => {
  const { tweet } = req.body;
  let decoded = await decodeToken(req, res);

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
