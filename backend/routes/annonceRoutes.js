// routes/annonceRoutes.js — adresses des annonces
const express = require("express");
const { listerAnnonces, voirAnnonce } = require("../controllers/annonceController");

const router = express.Router();

router.get("/annonces", listerAnnonces);                            // liste + filtres (public)
router.get("/annonces/:id", voirAnnonce);                           // détail d'une annonce (public)

module.exports = router;