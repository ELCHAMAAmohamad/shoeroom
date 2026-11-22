const Annonce = require("../models/annonceModel");                // requêtes SQL des annonces
const Achat = require("../models/achatModel");                    // requêtes SQL des achats

// GET /api/moi/annonces : mes annonces, en vente et vendues
async function mesAnnonces(req, res) {                            // req.utilisateur a été rempli par le vigile
  try {
    const annonces = await Annonce.listerParVendeur(req.utilisateur.id); // l'id vient du JETON, jamais de l'adresse
    res.json(annonces);                                           // renvoie la liste (vide si aucune annonce)
  } catch (erreur) {                                              // erreur imprévue
    console.error(erreur);                                        // affichée dans le terminal
    res.status(500).json({ message: "Erreur du serveur." });      // 500 = erreur du serveur
  }
}

async function mesAchats(req, res) {                              // GET /api/moi/achats : ce que j'ai acheté
  try {
    const achats = await Achat.listerParAcheteur(req.utilisateur.id); // l'id vient du JETON
    res.json(achats);                                             // renvoie la liste (vide si aucun achat)
  } catch (erreur) {                                              // erreur imprévue
    console.error(erreur);                                        // affichée dans le terminal
    res.status(500).json({ message: "Erreur du serveur." });      // 500 = erreur du serveur
  }
}

module.exports = { mesAnnonces, mesAchats };                      // partagées avec compteRoutes.js