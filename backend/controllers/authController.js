
const jwt = require("jsonwebtoken");                              
const bcrypt = require("bcryptjs");
const Utilisateur = require("../models/utilisateurModel");

async function inscription(req, res) {
  try {
    const { nom,prenom, email, motDePasse } = req.body || {}; 

    
    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (motDePasse.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
    }
    if (await Utilisateur.trouverParEmail(email)) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }
    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);
    const id = await Utilisateur.creer(nom, prenom, email, motDePasseChiffre);

    res.status(201).json({ message: "Compte créé.", utilisateur: { id, nom, prenom, email, role: "membre" } });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

async function connexion(req, res) {
  try {
    const { email, motDePasse } = req.body || {};

    if (!email || !motDePasse) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires." });
    }
    const utilisateur = await Utilisateur.trouverParEmail(email);
    const ok = utilisateur && (await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_util));
    if (!ok) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }
    const jeton = jwt.sign(
      { id: utilisateur.id_util, role: utilisateur.role_util },   
      process.env.JWT_SECRET,                                     
      { expiresIn: "8h" }                                         
    );
    
    res.json({
      message: "Connexion réussie.",
      jeton, 
      utilisateur: {
        id: utilisateur.id_util,
        nom: utilisateur.nom_util,
        prenom: utilisateur.prenom_util,
        email: utilisateur.email_util,
        role: utilisateur.role_util,
      },
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

module.exports = { inscription, connexion };