
const express = require("express");
const { verifierConnexion } = require("../middlewares/authMiddleware"); 
const { inscription, connexion } = require("../controllers/authController");

const router = express.Router();

router.post("/inscription", inscription);
router.post("/connexion", connexion);
router.get("/moi", verifierConnexion, (req, res) => {
  res.json({ message: "Jeton valide.", utilisateur: req.utilisateur });
});

module.exports = router;