// routes/annonceRoutes.js — adresses des annonces
const express = require("express");
const { listerAnnonces, voirAnnonce, publierAnnonce, acheterAnnonce } = require("../controllers/annonceController");
const { verifierConnexion } = require("../middlewares/authMiddleware");
const { recevoirPhotos } = require("../middlewares/uploadPhotos");

const router = express.Router();

router.get("/annonces", listerAnnonces);                            // liste + filtres (public)
router.get("/annonces/:id", voirAnnonce);                           // détail d'une annonce (public)
router.post("/annonces", verifierConnexion, recevoirPhotos, publierAnnonce); // publier : vigile -> photos -> controller
router.post("/annonces/:id/acheter", verifierConnexion, acheterAnnonce); // acheter : vigile -> controller

module.exports = router;