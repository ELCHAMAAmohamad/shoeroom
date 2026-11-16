// controllers/annonceController.js — logique des annonces
const Annonce = require("../models/annonceModel");                 // les requêtes SQL des annonces

// GET /api/annonces?marque=&size=&prixMin=&prixMax=&etat=&q=
async function listerAnnonces(req, res) {
  try {
    const { marque, size, prixMin, prixMax, etat, q } = req.query; // les filtres sont dans l'adresse (après le ?)
    const annonces = await Annonce.lister({ marque, size, prixMin, prixMax, etat, q });
    res.json(annonces);                                            // renvoie la liste (vide si rien ne correspond)
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

// GET /api/annonces/:id
async function voirAnnonce(req, res) {
  try {
    const annonce = await Annonce.trouverParId(req.params.id);     // :id dans l'adresse -> req.params.id
    if (!annonce) {                                                // aucune annonce avec ce numéro
      return res.status(404).json({ message: "Annonce introuvable." });
    }
    annonce.photos = await Annonce.listerPhotos(annonce.id_annonce); // ajoute la liste des photos
    res.json(annonce);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

module.exports = { listerAnnonces, voirAnnonce };