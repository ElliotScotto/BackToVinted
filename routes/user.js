const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
//
const User = require("../models/User");
//
router.post("/user/signup", async (req, res) => {
  try {
    //on fait un destructuring:
    const { username, email, password, newsletter } = req.body;
    const user = await User.findOne({ email: email });
    if (!email || !password || !username) {
      return res.json({ message: "Missing parameter" });
    }
    if (user) {
      res.status(409).json({ message: "Mail address already exists" }); //Si l'adresse mail existe déjà
    } else {
      //On crée le token de réponse...
      const token = uid2(64);
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const newUser = await new User({
        email: email,
        account: { username: username },
        newsletter: newsletter,
        token: token,
        salt: salt,
        hash: hash,
      });
      await newUser.save();
      const messageAccountCreation = "Your account has successfully created !";
      res.status(200).json({
        //On retourne une version edulcorée de newUser, sans le hash et le salt.
        _id: newUser._id,
        token: newUser.token,
        account: { username: username },
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//On crée une route pour se logguer
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (user) {
      const newHash = SHA256(req.body.password + user.salt).toString(encBase64);
      if (newHash === user.hash) {
        res.json({
          _id: user._id,
          token: user.token,
          account: user.account,
          message: { message: "Access autorized" },
        });
      } else {
        return res.status(401).json({ message: "Unauthorized access" });
      }
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});
//
module.exports = router;
