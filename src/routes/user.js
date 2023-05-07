import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

import User from "../../db/userModel.js";
import decodeToken from "../decodeToken.js";

const router = express.Router();

router.post("/signup", (req, res) => {
  console.log("req.files", req.files);
  if (!req.files) {
    return res.status(400).send({
      message: "No files were uploaded",
    });
  } else {
    const {
      name,
      email,
      password,
      nickname,
      about,
      employment,
      hometown,
      webbpage,
    } = req.body;

    const { profilePicture } = req.files;
    profilePicture.mv(`public/images/${nickname}.png`);

    bcrypt
      .hash(password, 10)
      .then((hashedPassword) => {
        const user = new User({
          name: name,
          email: email,
          password: hashedPassword,
          nickname: nickname,
          about: about,
          employment: employment,
          hometown: hometown,
          webbpage: webbpage,
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
            console.log("Error", error);
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
  }
});
router.post("/login", (req, res) => {
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
            { id: user._id, email: user.email, nickname: user.nickname },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
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
router.get("/JWT", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  res.status(200).send({
    message: "Authorized",
    decoded,
  });
});

// DONT FORGET TO DELETE THIS ROUTE
router.get("/all", (req, res) => {
  User.find()
    .then((users) => {
      res.status(200).send({
        message: "All users",
        users,
      });
    })
    .catch((e) => {
      res.status(500).send({
        message: "Error getting users",
        e,
      });
    });
});

router.get("/profile/:nickname", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const { nickname } = req.params;

  User.findOne({ nickname: nickname })
    .then((user) => {
      const userToSend = user.toObject();
      delete userToSend.password;

      let isFollowing = false;
      if (userToSend.followers !== undefined) {
        userToSend.followers.forEach((follower) => {
          if (follower.follower === decoded.nickname) {
            isFollowing = true;
          }
        });
      }

      res.status(200).send({
        message: "User found",
        isFollowing,
        userToSend,
      });
    })
    .catch((e) => {
      res.status(404).send({
        message: "No User Found",
        e,
      });
    });
});

router.put("/forgotpassword", (req, res) => {
  const { email, nickname, newPassword } = req.body;

  User.findOne({ email: email, nickname: nickname })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      bcrypt.hash(newPassword, 10).then((hashedPassword) => {
        user.password = hashedPassword;
        user.save().then(() => {
          res.status(200).send({ message: "Password updated successfully" });
        });
      });
    })
    .catch((e) => {
      res.status(500).send({ message: "Server error", e });
    });
});

router.post("/follow", (req, res) => {
  let decoded = decodeToken(req, res);
  if (decoded === undefined) return;
  const toBeFollowedNickname = req.body.nickname;
  const toFollowNickname = decoded.nickname;
  let response = [];
  if (toBeFollowedNickname === toFollowNickname) {
    return res
      .status(400)
      .send({ message: "You cannot follow yourself, silly" });
  }
  User.findOne({ nickname: toBeFollowedNickname })
    .then((user) => {
      if (
        user.followers.find(
          (follower) => follower.follower === toFollowNickname
        )
      ) {
        console.log("User", user);
        return res
          .status(400)
          .send({ message: "User is already being followed" });
      } else {
        console.log("User", user);
        user.followers.push({ follower: toFollowNickname });
        user.save().then(() => {
          response.push({ message: "User followed successfully" });

          User.findOne({ nickname: toFollowNickname })
            .then((user) => {
              if (
                user.following.find(
                  (followed) => followed.followed === toBeFollowedNickname
                )
              ) {
                return res
                  .status(400)
                  .send({ message: "You are already following the user" });
              } else {
                user.following.push({ followed: toBeFollowedNickname });
                user.save().then(() => {
                  response.push({ message: "User followed successfully" });
                  res.status(200).send(response);
                });
              }
            })
            .catch((e) => {
              res.status(500).send({ message: "Server error", e });
            });
        });
      }
    })
    .catch((e) => {
      res.status(400).send({ message: "No nickaname", e });
    });
});

export default router;
