// controllers/annonceController.js — logique des annonces : vérifier, décider, répondre
const fs = require("fs");                                         // outil de Node pour supprimer des fichiers
const Achat = require("../models/achatModel");                    // requêtes SQL des achats
const Annonce = require("../models/annonceModel");                // requêtes SQL des annonces

// GET /api/annonces?marque=nike&size=42…  (public)
async function listerAnnonces(req, res) {
  try {
    const { marque, size, prixMin, prixMax, etat, q } = req.query; // req.query = les filtres écrits après le "?" de l'adresse
    const annonces = await Annonce.lister({ marque, size, prixMin, prixMax, etat, q }); // le model construit le SELECT
    res.json(annonces);                                           // renvoie la liste en JSON (vide si rien)
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

// GET /api/annonces/:id  (public)
async function voirAnnonce(req, res) {
  try {
    const annonce = await Annonce.trouverParId(req.params.id);    // req.params.id = le nombre à la place de :id dans l'adresse
    if (!annonce) {                                               // aucune annonce avec ce numéro
      return res.status(404).json({ message: "Annonce introuvable." }); // 404 = introuvable
    }
    annonce.photos = await Annonce.listerPhotos(annonce.id_annonce); // on ajoute la liste des photos à l'annonce
    res.json(annonce);                                            // renvoie l'annonce complète
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

// Supprime les photos déjà reçues quand l'annonce est refusée (sinon elles resteraient dans uploads)
function supprimerPhotos(fichiers) {
  (fichiers || []).forEach((f) => fs.unlink(f.path, () => {}));   // f.path = chemin complet du fichier ; unlink = supprimer
}

// POST /api/annonces  (protégée : vigile -> photos -> ici)
async function publierAnnonce(req, res) {
  const photos = req.files || [];                                 // les photos déjà rangées par multer (uploadPhotos.js)
  try {
    const { titre, marque, size, prix, etat, description } = req.body || {}; // les champs texte du formulaire
    if (!titre || !marque || !size || !prix || !etat) {           // 1. un champ obligatoire est vide
      supprimerPhotos(photos);
      return res.status(400).json({ message: "Titre, marque, pointure, prix et état sont obligatoires." });
    }
    if (isNaN(size) || Number(size) < 30 || Number(size) > 50) {  // 2. pointure pas un nombre, ou hors 30–50
      supprimerPhotos(photos);
      return res.status(400).json({ message: "La pointure doit être entre 30 et 50." });
    }
    if (isNaN(prix) || Number(prix) < 0) {                        // 3. prix pas un nombre, ou négatif
      supprimerPhotos(photos);
      return res.status(400).json({ message: "Le prix doit être un nombre positif." });
    }
    if (!["neuves", "occasion"].includes(etat)) {                 // 4. état différent des 2 valeurs de l'ENUM
      supprimerPhotos(photos);
      return res.status(400).json({ message: "L'état doit être « neuves » ou « occasion »." });
    }
    if (photos.length === 0) {                                    // 5. aucune photo
      return res.status(400).json({ message: "Ajoutez au moins une photo." });
    }

    const idAnnonce = await Annonce.creer({ titre, marque, size, prix, etat, description }, req.utilisateur.id); // le vendeur vient du JETON

    for (const photo of photos) {                                 // une ligne dans photos_annonces par photo
      await Annonce.ajouterPhoto(idAnnonce, photo.filename);      // filename = le nom unique donné par multer
    }

    res.status(201).json({ message: "Annonce publiée.", id: idAnnonce }); // 201 = créé ; la page ouvre ensuite cette annonce
  } catch (erreur) {
    console.error(erreur);
    supprimerPhotos(photos);                                      // erreur imprévue : on ne garde pas les photos
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

// POST /api/annonces/:id/acheter  (protégée : vigile -> ici)
async function acheterAnnonce(req, res) {
  try {
    const annonce = await Annonce.trouverParId(req.params.id);    // l'annonce qu'on veut acheter
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }
    if (annonce.id_vendeur_annonce === req.utilisateur.id) {      // l'acheteur (jeton) est le vendeur ?
      return res.status(403).json({ message: "Vous ne pouvez pas acheter votre propre annonce." }); // 403 = interdit
    }
    if (annonce.statut_annonce === "vendue") {                    // déjà vendue
      return res.status(409).json({ message: "Cette paire a déjà été vendue." }); // 409 = conflit
    }

    const ok = await Achat.acheter(annonce.id_annonce, req.utilisateur.id); // transaction : UPDATE + INSERT ensemble
    if (!ok) {                                                    // quelqu'un l'a achetée juste avant
      return res.status(409).json({ message: "Cette paire a déjà été vendue." });
    }

    res.status(201).json({ message: "Achat confirmé.", idAnnonce: annonce.id_annonce }); // 201 = un achat a été créé
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

module.exports = { listerAnnonces, voirAnnonce, publierAnnonce, acheterAnnonce }; // partagées avec annonceRoutes.js