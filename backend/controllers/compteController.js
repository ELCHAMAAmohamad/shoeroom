const Annonce = require("../models/annonceModel");                 
const Achat = require("../models/achatModel");                     

// GET /api/moi/annonces : mes annonces, en vente et vendues
async function mesAnnonces(req, res) {
  try {
    const annonces = await Annonce.listerParVendeur(req.utilisateur.id); 
    res.json(annonces);                                            
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

async function mesAchats(req, res) {
  try {
    const achats = await Achat.listerParAcheteur(req.utilisateur.id); 
    res.json(achats);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

module.exports = { mesAnnonces, mesAchats };