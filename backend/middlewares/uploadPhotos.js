// middlewares/uploadPhotos.js — recevoir les photos d'une annonce avec multer (le « vigile des photos »)
const multer = require("multer");                                 // bibliothèque qui lit les fichiers envoyés par un formulaire
const path = require("path");                                     // pour construire le chemin du dossier

const dossier = path.join(__dirname, "..", "uploads");            // backend/uploads : là où on range les photos

const stockage = multer.diskStorage({                             // où et sous quel nom on range chaque photo
  destination: dossier,                                           // dans backend/uploads
  filename: (req, fichier, rappel) => {                           // multer nous demande le nom du fichier
    const extension = fichier.mimetype === "image/png" ? ".png" : ".jpg"; // extension selon le vrai type du fichier
    const nom = Date.now() + "-" + Math.round(Math.random() * 1e9) + extension; // nom unique : heure + nombre au hasard
    rappel(null, nom);                                            // on donne ce nom à multer (null = pas d'erreur)
  },
});

const upload = multer({
  storage: stockage,                                              // utilise le rangement défini au-dessus
  limits: { fileSize: 2 * 1024 * 1024, files: 10 },               // 2 Mo par photo, 10 photos maximum
  fileFilter: (req, fichier, rappel) => {                         // trie chaque fichier AVANT de le garder
    const accepte = ["image/jpeg", "image/png"].includes(fichier.mimetype); // seulement JPG et PNG
    rappel(accepte ? null : new Error("TYPE_REFUSE"), accepte);   // refusé -> erreur TYPE_REFUSE
  },
});

// Le middleware utilisé dans la route : reçoit le champ "photos" et traduit les erreurs en messages clairs
function recevoirPhotos(req, res, next) {
  upload.array("photos", 10)(req, res, (erreur) => {              // "photos" = le name du champ fichier ; 10 maximum
    if (!erreur) return next();                                   // tout va bien : on passe au controller (req.files est rempli)
    let message = "Erreur pendant l'envoi des photos.";           // message par défaut
    if (erreur.code === "LIMIT_FILE_SIZE") message = "Chaque photo doit faire 2 Mo maximum.";
    if (erreur.code === "LIMIT_FILE_COUNT" || erreur.code === "LIMIT_UNEXPECTED_FILE") message = "10 photos maximum.";
    if (erreur.message === "TYPE_REFUSE") message = "Seules les photos JPG ou PNG sont acceptées.";
    res.status(400).json({ message });                            // 400 = la demande est incorrecte, on s'arrête
  });
}

module.exports = { recevoirPhotos };                              // utilisé dans annonceRoutes.js