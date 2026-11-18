// controllers/annonceController.js — logique des annonces
const fs = require("fs");                                          // pour supprimer des fichiers
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
// Supprime les photos déjà reçues quand l'annonce est refusée (sinon elles resteraient dans uploads)
function supprimerPhotos(fichiers) {
  (fichiers || []).forEach((f) => fs.unlink(f.path, () => {}));    // f.path = chemin complet du fichier
}

// POST /api/annonces  (protégée : il faut être connecté)
async function publierAnnonce(req, res) {
  const photos = req.files || [];                                  // les photos rangées par multer
  try {
    const { titre, marque, size, prix, etat, description } = req.body || {}; // les champs texte du formulaire

    // 1. Vérifier les champs obligatoires
    if (!titre || !marque || !size || !prix || !etat) {
      supprimerPhotos(photos);
      return res.status(400).json({ message: "Titre, marque, pointure, prix et état sont obligatoires." });
    }
    // 2. Vérifier les valeurs
    if (isNaN(size) || Number(size) < 30 || Number(size) > 50) {  // pointure entre 30 et 50
      supprimerPhotos(photos);
      return res.status(400).json({ message: "La pointure doit être entre 30 et 50." });
    }
    if (isNaN(prix) || Number(prix) < 0) {                         // prix positif
      supprimerPhotos(photos);
      return res.status(400).json({ message: "Le prix doit être un nombre positif." });
    }
    if (!["neuves", "occasion"].includes(etat)) {                  // seulement les 2 valeurs de l'ENUM
      supprimerPhotos(photos);
      return res.status(400).json({ message: "L'état doit être « neuves » ou « occasion »." });
    }
    // 3. Au moins une photo
    if (photos.length === 0) {
      return res.status(400).json({ message: "Ajoutez au moins une photo." });
    }

    // 4. Enregistrer l'annonce : le vendeur vient du JETON (req.utilisateur), jamais du formulaire
    const idAnnonce = await Annonce.creer({ titre, marque, size, prix, etat, description }, req.utilisateur.id);

    // 5. Enregistrer chaque photo, reliée à l'annonce
    for (const photo of photos) {
      await Annonce.ajouterPhoto(idAnnonce, photo.filename);      // filename = le nom donné par multer
    }

    res.status(201).json({ message: "Annonce publiée.", id: idAnnonce }); // 201 = créé
  } catch (erreur) {
    console.error(erreur);
    supprimerPhotos(photos);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}
module.exports = { listerAnnonces, voirAnnonce, publierAnnonce };