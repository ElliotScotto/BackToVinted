const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
//
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
//
//
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      console.log("Je passe dans ma route /offer/publish");
      //On fait un destructuring
      const { title, condition, price, description, city, brand, size, color } =
        req.body;
      // console.log(req.files);
      const newOffer = await new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user._id,
      });
      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );
      newOffer.product_image = result;
      await newOffer.save();
      // console.log(result);
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);
//
router.get("/offers", async (req, res) => {
  try {
    console.log("je passe dans ma route /offers");
    //Destructuring
    const { title, priceMin, priceMax, sort, page } = req.query;
    //On crée un objet vide dans lequel tous les résultats des filtres selectionnées seront intégré.
    const filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin && priceMax) {
      filters.product_price = { $gte: priceMin, $lte: priceMax };
    }
    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) }; //On met le type Number avant la requête pour bien être sur de le convertir en nombre.
    }
    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }
    const sortFilter = {};
    if (sort === "price-desc") {
      sortFilter.product_price = "desc";
    } else if (sort === "price-asc") {
      sortFilter.product_price = "asc";
    }
    //
    const limitDisplay = 5; //Nombre d'éléments de DB affichés par page.
    let pageRequired = 1; //Affiche la page par défault.
    if (page) {
      pageRequired = Number(page);
    }
    const skip = (pageRequired - 1) * limitDisplay;
    // const offers affiche un objet remplit par les filtres selectionnés avec l'objet filters.
    const offers = await Offer.find(filters)
      .sort(sortFilter)
      .skip(skip)
      .limit(limitDisplay)
      // .select("product_nam product_price owner")
      .populate("owner", "account _id");
    const offersCount = await Offer.countDocuments(filters);
    //
    //
    res.json({ Count: offersCount, offers: offers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//
router.get("/offers/:id", async (req, res) => {
  try {
    console.log("je passe dans ma route /offers/:id");
    const offerById = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offerById);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
