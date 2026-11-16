// middlewares/authMiddleware.js — le vigile : vérifie le jeton (bracelet)
const jwt = require("jsonwebtoken");                              // l'outil des jetons

function verifierConnexion(req, res, next) {                      // s'exécute AVANT le controller
  const entete = req.headers.authorization || "";                 // lit le bracelet envoyé par le navigateur
  const jeton = entete.startsWith("Bearer ") ? entete.slice(7) : null; // enlève le mot "Bearer " devant

  if (!jeton) {                                                   // pas de bracelet ?
    return res.status(401).json({ message: "Vous devez être connecté." }); // on refuse
  }

  try {
    req.utilisateur = jwt.verify(jeton, process.env.JWT_SECRET);  // vérifie le tampon et lit { id, role }
    next();                                                       // bracelet valide : on laisse passer
  } catch (erreur) {                                              // faux bracelet ou bracelet expiré
    return res.status(401).json({ message: "Session expirée, reconnectez-vous." });
  }
}

function verifierAdmin(req, res, next) {                          // vigile spécial pour l'admin
  if (req.utilisateur.role !== "admin") {                         // pas admin ?
    return res.status(403).json({ message: "Accès réservé à l'administrateur." }); // on refuse
  }
  next();                                                         // admin : on laisse passer
}

module.exports = { verifierConnexion, verifierAdmin };            // partage les 2 vigiles