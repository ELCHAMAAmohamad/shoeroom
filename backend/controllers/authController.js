// controllers/authController.js — logique de l'inscription et de la connexion
//bcryptjs pour chiffrer les mots de passe à l’inscription avec hash, 
// et pour les vérifier à la connexion avec compare. 
// Le mot de passe n’est jamais stocké en clair. »
const jwt = require("jsonwebtoken");                              // l'outil pour fabriquer les jetons
const bcrypt = require("bcryptjs");
const Utilisateur = require("../models/utilisateurModel");

// POST /api/inscription
async function inscription(req, res) {
  try {
    const { nom,prenom, email, motDePasse } = req.body || {}; //évite une erreur si rien n'est envoyé

    // 1. Vérifier que tous les champs sont remplis
    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    // 2. Vérifier la longueur du mot de passe
    if (motDePasse.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
    }
    // 3. Vérifier que l'email n'est pas déjà utilisé
    if (await Utilisateur.trouverParEmail(email)) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }
    // 4. Chiffrer le mot de passe, puis enregistrer l'utilisateur
    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);
    const id = await Utilisateur.creer(nom, prenom, email, motDePasseChiffre);

    res.status(201).json({ message: "Compte créé.", utilisateur: { id, nom, prenom, email, role: "membre" } });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur du serveur." });
  }
}

// POST /api/connexion
async function connexion(req, res) {
  try {
    const { email, motDePasse } = req.body || {}; // "|| {}" : évite une erreur si rien n'est envoyé

    if (!email || !motDePasse) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires." });
    }
    // 1. Chercher l'utilisateur
    const utilisateur = await Utilisateur.trouverParEmail(email);
    // 2. Comparer le mot de passe tapé avec le mot de passe chiffré
    const ok = utilisateur && (await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_util));
    if (!ok) {
      // Même message dans les deux cas : on ne dit pas si l'email existe
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }
    // 3. Renvoyer l'utilisateur, sans le mot de passe
    const jeton = jwt.sign(
      { id: utilisateur.id_util, role: utilisateur.role_util },   // ce qui est écrit sur le bracelet
      process.env.JWT_SECRET,                                     // le tampon secret
      { expiresIn: "8h" }                                         // le bracelet est valable 8 heures
    );
    
    res.json({
      message: "Connexion réussie.",
      jeton, // le bracelet à mettre dans l'en-tête Authorization du navigateur
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