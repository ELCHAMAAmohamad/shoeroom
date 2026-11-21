const jwt = require("jsonwebtoken");                              

function verifierConnexion(req, res, next) {                      
  const entete = req.headers.authorization || "";                 
  const jeton = entete.startsWith("Bearer ") ? entete.slice(7) : null; 

  if (!jeton) {                                                   
    return res.status(401).json({ message: "Vous devez être connecté." }); 
  }

  try {
    req.utilisateur = jwt.verify(jeton, process.env.JWT_SECRET);  
    next();                                                       
  } catch (erreur) {                                              
    return res.status(401).json({ message: "Session expirée, reconnectez-vous." });
  }
}

function verifierAdmin(req, res, next) {                          
  if (req.utilisateur.role !== "admin") {                         
    return res.status(403).json({ message: "Accès réservé à l'administrateur." }); 
  }
  next();                                                        
}

module.exports = { verifierConnexion, verifierAdmin };           