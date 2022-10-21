const mongoose = require("mongoose");
const User = require("./User");
//
//
const Offer = mongoose.model("Offer", {
  product_name: { type: String, maxlength: 50 },
  product_description: { type: String, maxlength: 500 },
  product_price: { type: Number, max: 100000 },
  product_details: Array,
  product_image: Object,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
//
module.exports = Offer;
