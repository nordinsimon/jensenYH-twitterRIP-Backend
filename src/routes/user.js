import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

import User from "../../db/userModel.js";

const router = express.Router();

router.post("/signup", (req, res) => {
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
            { id: user._id, email: user.email },
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
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }
    res.status(200).send({
      message: "Authorized",
      decoded,
    });
  });
});

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

export default router;
