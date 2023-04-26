import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const decodeToken = async (req, res) => {
  let token = (await req.body.token) || (await req.query.token);
  if (!token) {
    let x = await req.headers.authorization;
    if (x === undefined) {
      // Vi hittade ingen token, authorization fail
      res.sendStatus(401);
      return;
    }
    token = x.split(" ")[1];
  }
  let output;

  console.log("sfeefsfe token", token);
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }
    output = decoded;
    console.log("decoded", decoded);
  });
  return output;
};

export default decodeToken;
