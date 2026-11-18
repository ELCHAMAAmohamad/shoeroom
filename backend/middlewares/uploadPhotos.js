// middlewares/uploadPhotos.js — recevoir les photos d'une annonce (multer)
const multer = require("multer");                                 // bibliothèque qui lit les fichiers envoyés
const path = require("path");

const dossier = path.join(__dirname, "..", "uploads");            // backend/uploads

const stockage = multer.diskStorage({                             // où et sous quel nom on range chaque photo
  destination: dossier,                                           // dans backend/uploads
  filename: (req, fichier, rappel) => {
    const extension = fichier.mimetype === "image/png" ? ".png" : ".jpg"; // extension selon le vrai type
    const nom = Date.now() + "-" + Math.round(Math.random() * 1e9) + extension; // nom unique, ex. 1763459200000-123456789.jpg
    rappel(null, nom);                                            // on donne ce nom à multer
  },
});

const upload = multer({
  storage: stockage,
  limits: { fileSize: 2 * 1024 * 1024, files: 10},                // 2 Mo par photo, 10 photos maximum
  fileFilter: (req, fichier, rappel) => {                         // on trie les fichiers AVANT de les garder
    const accepte = ["image/jpeg", "image/png"].includes(fichier.mimetype); // seulement JPG et PNG
    rappel(accepte ? null : new Error("TYPE_REFUSE"), accepte);
  },
});

// Le middleware utilisé dans la route : reçoit le champ "photos" et traduit les erreurs en messages clairs
function recevoirPhotos(req, res, next) {
  upload.array("photos", 10)(req, res, (erreur) => {               // "photos" = le name du champ dans le formulaire
    if (!erreur) return next();                                   // tout va bien : on passe au controller
    let message = "Erreur pendant l'envoi des photos.";
    if (erreur.code === "LIMIT_FILE_SIZE") message = "Chaque photo doit faire 2 Mo maximum.";
    if (erreur.code === "LIMIT_FILE_COUNT" || erreur.code === "LIMIT_UNEXPECTED_FILE") message = "10 photos maximum.";
    if (erreur.message === "TYPE_REFUSE") message = "Seules les photos JPG ou PNG sont acceptées.";
    res.status(400).json({ message });                            // 400 = la demande est incorrecte
  });
}

module.exports = { recevoirPhotos };