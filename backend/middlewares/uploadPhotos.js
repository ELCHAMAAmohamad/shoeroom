const multer = require("multer");                                 
const path = require("path");

const dossier = path.join(__dirname, "..", "uploads");            

const stockage = multer.diskStorage({                             
  destination: dossier,                                           
  filename: (req, fichier, rappel) => {
    const extension = fichier.mimetype === "image/png" ? ".png" : ".jpg"; 
    const nom = Date.now() + "-" + Math.round(Math.random() * 1e9) + extension; 
    rappel(null, nom);                                            
  },
});

const upload = multer({
  storage: stockage,
  limits: { fileSize: 2 * 1024 * 1024, files: 10},                
  fileFilter: (req, fichier, rappel) => {                         
    const accepte = ["image/jpeg", "image/png"].includes(fichier.mimetype); 
    rappel(accepte ? null : new Error("TYPE_REFUSE"), accepte);
  },
});

function recevoirPhotos(req, res, next) {
  upload.array("photos", 10)(req, res, (erreur) => {               
    if (!erreur) return next();                                   
    let message = "Erreur pendant l'envoi des photos.";
    if (erreur.code === "LIMIT_FILE_SIZE") message = "Chaque photo doit faire 2 Mo maximum.";
    if (erreur.code === "LIMIT_FILE_COUNT" || erreur.code === "LIMIT_UNEXPECTED_FILE") message = "10 photos maximum.";
    if (erreur.message === "TYPE_REFUSE") message = "Seules les photos JPG ou PNG sont acceptées.";
    res.status(400).json({ message });                            
  });
}

module.exports = { recevoirPhotos };