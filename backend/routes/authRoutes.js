// routes/authRoutes.js — adresses de l'inscription et de la connexion
//Le fichier de routes associe chaque adresse de l’API à 
// une fonction du controller. Par exemple, un POST sur /api/inscription appelle la fonction inscription.
const express = require("express");
const { verifierConnexion } = require("../middlewares/authMiddleware"); // le vigile
const { inscription, connexion } = require("../controllers/authController");

const router = express.Router();

router.post("/inscription", inscription);
router.post("/connexion", connexion);
// Route de test protégée : le vigile vérifie le bracelet, puis on répond qui est connecté
router.get("/moi", verifierConnexion, (req, res) => {
  res.json({ message: "Jeton valide.", utilisateur: req.utilisateur });
});

module.exports = router;