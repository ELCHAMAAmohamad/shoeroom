// routes/annonceRoutes.js — quelle adresse appelle quelle fonction (pour les annonces)
const express = require("express");
const { listerAnnonces, voirAnnonce, publierAnnonce, acheterAnnonce } = require("../controllers/annonceController"); // le controller
const { verifierConnexion } = require("../middlewares/authMiddleware"); // le vigile du jeton
const { recevoirPhotos } = require("../middlewares/uploadPhotos");      // le vigile des photos

const router = express.Router();                                    // branché dans server.js sur /api

router.get("/annonces", listerAnnonces);                            // GET /api/annonces → liste + filtres (public)
router.get("/annonces/:id", voirAnnonce);                           // GET /api/annonces/3 → détail d'une annonce (public)
router.post("/annonces", verifierConnexion, recevoirPhotos, publierAnnonce); // POST /api/annonces → vigile -> photos -> controller
router.post("/annonces/:id/acheter", verifierConnexion, acheterAnnonce); // POST /api/annonces/3/acheter → vigile -> controller

module.exports = router;                                            // récupéré par server.js : app.use("/api", annonceRoutes)