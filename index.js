const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(express.json());
// mongoose.connect("mongodb://localhost/vinted");
mongoose.connect(process.env.MONGODB_URI);
app.use(cors());
//
// console.log("salut");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
//
//import des models
const User = require("./models/User");
//
//import des routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
//
//
app.get("/", (req, res) => {
  res.json({ message: "Home : Welcome on my server" });
});
// app.all("*", (req, res) => {
//   res.status(404).json("Page introuvable de back-vinted");
// });
const PORT = 3000;
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server has started on ${PORT}`);
});
