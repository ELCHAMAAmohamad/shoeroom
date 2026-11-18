const fs = require("fs");         
const Achat = require("../models/achatModel");                                                   
const Annonce = require("../models/annonceModel");                 

async function listerAnnonces(req, res) {
  try {
    const { marque, size, prixMin, prixMax, etat, q } = req.query; 
    const annonces = await Annonce.lister({ marque, size, prixMin, prixMax, etat, q });
    res.json(annonces);                                           
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

async function voirAnnonce(req, res) {
  try {
    const annonce = await Annonce.trouverParId(req.params.id);     
    if (!annonce) {                                                
      return res.status(404).json({ message: "Annonce introuvable." });
    }
    annonce.photos = await Annonce.listerPhotos(annonce.id_annonce); 
    res.json(annonce);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}
function supprimerPhotos(fichiers) {
  (fichiers || []).forEach((f) => fs.unlink(f.path, () => {}));    
}

// POST /api/annonces  (protégée : il faut être connecté)
async function publierAnnonce(req, res) {
  const photos = req.files || [];                                 
  try {
    const { titre, marque, size, prix, etat, description } = req.body || {}; 
    if (!titre || !marque || !size || !prix || !etat) {
      supprimerPhotos(photos);
      return res.status(400).json({ message: "Titre, marque, pointure, prix et état sont obligatoires." });
    }
    if (isNaN(size) || Number(size) < 30 || Number(size) > 50) {  
      supprimerPhotos(photos);
      return res.status(400).json({ message: "La pointure doit être entre 30 et 50." });
    }
    if (isNaN(prix) || Number(prix) < 0) {                         
      supprimerPhotos(photos);
      return res.status(400).json({ message: "Le prix doit être un nombre positif." });
    }
    if (!["neuves", "occasion"].includes(etat)) {                  
      supprimerPhotos(photos);
      return res.status(400).json({ message: "L'état doit être « neuves » ou « occasion »." });
    }
    if (photos.length === 0) {
      return res.status(400).json({ message: "Ajoutez au moins une photo." });
    }

    const idAnnonce = await Annonce.creer({ titre, marque, size, prix, etat, description }, req.utilisateur.id);

    for (const photo of photos) {
      await Annonce.ajouterPhoto(idAnnonce, photo.filename);      
    }

    res.status(201).json({ message: "Annonce publiée.", id: idAnnonce }); 
  } catch (erreur) {
    console.error(erreur);
    supprimerPhotos(photos);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}
async function acheterAnnonce(req, res) {
  try {
    const annonce = await Annonce.trouverParId(req.params.id);     
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }
    if (annonce.id_vendeur_annonce === req.utilisateur.id) {       
      return res.status(403).json({ message: "Vous ne pouvez pas acheter votre propre annonce." });
    }
    if (annonce.statut_annonce === "vendue") {
      return res.status(409).json({ message: "Cette paire a déjà été vendue." });
    }

    const ok = await Achat.acheter(annonce.id_annonce, req.utilisateur.id); 
    if (!ok) {                                                     
      return res.status(409).json({ message: "Cette paire a déjà été vendue." });
    }

    res.status(201).json({ message: "Achat confirmé.", idAnnonce: annonce.id_annonce }); 
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}
module.exports = { listerAnnonces, voirAnnonce, publierAnnonce, acheterAnnonce };