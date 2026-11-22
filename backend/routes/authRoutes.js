// routes/authRoutes.js — quelle adresse appelle quelle fonction (pour les comptes)
const express = require("express");
const { verifierConnexion } = require("../middlewares/authMiddleware"); // le vigile
const { inscription, connexion } = require("../controllers/authController"); // les fonctions du controller

const router = express.Router();                    // un « mini-serveur » de routes, branché dans server.js sur /api

router.post("/inscription", inscription);           // POST /api/inscription → inscription() (public)
router.post("/connexion", connexion);               // POST /api/connexion → connexion() (public)
router.get("/moi", verifierConnexion, (req, res) => {  // GET /api/moi → le vigile d'abord, puis cette petite fonction
  res.json({ message: "Jeton valide.", utilisateur: req.utilisateur }); // renvoie ce que contient le jeton (id, role)
});

module.exports = router;                            // récupéré par server.js : app.use("/api", authRoutes)