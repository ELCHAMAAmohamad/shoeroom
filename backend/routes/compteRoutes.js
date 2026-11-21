const express = require("express");
const { mesAnnonces, mesAchats } = require("../controllers/compteController");
const { verifierConnexion } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/moi/annonces", verifierConnexion, mesAnnonces);      
router.get("/moi/achats", verifierConnexion, mesAchats);           

module.exports = router;