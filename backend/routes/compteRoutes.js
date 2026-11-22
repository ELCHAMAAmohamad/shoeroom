const express = require("express");                               // routes/compteRoutes.js — adresses de « Mon compte »
const { mesAnnonces, mesAchats } = require("../controllers/compteController"); // les 2 fonctions du controller
const { verifierConnexion } = require("../middlewares/authMiddleware"); // le vigile du jeton

const router = express.Router();                                  // branché dans server.js sur /api

router.get("/moi/annonces", verifierConnexion, mesAnnonces);      // GET /api/moi/annonces → vigile -> mes annonces
router.get("/moi/achats", verifierConnexion, mesAchats);          // GET /api/moi/achats → vigile -> mes achats

module.exports = router;                                          // récupéré par server.js : app.use("/api", compteRoutes)