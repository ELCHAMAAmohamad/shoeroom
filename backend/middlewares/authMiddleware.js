// middlewares/authMiddleware.js — le « vigile » : vérifie le jeton AVANT les routes protégées
const jwt = require("jsonwebtoken");                // pour vérifier la signature du jeton

function verifierConnexion(req, res, next) {        // next = « laisser passer à l'étape suivante »
  const entete = req.headers.authorization || "";   // l'en-tête envoyé par le navigateur : "Bearer eyJhbGci…"
  const jeton = entete.startsWith("Bearer ") ? entete.slice(7) : null; // enlève "Bearer " (7 caractères) pour garder le jeton

  if (!jeton) {                                     // pas de jeton = pas connecté
    return res.status(401).json({ message: "Vous devez être connecté." }); // 401 = non authentifié, on s'arrête
  }

  try {
    req.utilisateur = jwt.verify(jeton, process.env.JWT_SECRET); // vérifie la signature et la date ; range { id, role } dans req
    next();                                         // jeton valide : on passe au controller
  } catch (erreur) {                                // jeton faux, modifié ou expiré
    return res.status(401).json({ message: "Session expirée, reconnectez-vous." });
  }
}

function verifierAdmin(req, res, next) {            // s'utilise APRÈS verifierConnexion (req.utilisateur existe déjà)
  if (req.utilisateur.role !== "admin") {           // le rôle vient du jeton, impossible à falsifier
    return res.status(403).json({ message: "Accès réservé à l'administrateur." }); // 403 = connecté mais interdit
  }
  next();                                           // c'est l'admin : on laisse passer
}

module.exports = { verifierConnexion, verifierAdmin }; // utilisés dans les fichiers de routes