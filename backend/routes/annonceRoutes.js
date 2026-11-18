// routes/annonceRoutes.js — adresses des annonces
const express = require("express");
const { listerAnnonces, voirAnnonce, publierAnnonce } = require("../controllers/annonceController");
const { verifierConnexion } = require("../middlewares/authMiddleware");
const { recevoirPhotos } = require("../middlewares/uploadPhotos");

const router = express.Router();

router.get("/annonces", listerAnnonces);                            
router.get("/annonces/:id", voirAnnonce);                           
router.post("/annonces", verifierConnexion, recevoirPhotos, publierAnnonce); 

module.exports = router;