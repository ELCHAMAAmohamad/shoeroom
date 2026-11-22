// controllers/authController.js — inscription et connexion : vérifier, décider, répondre
const jwt = require("jsonwebtoken");                // pour créer le jeton de connexion (JWT)
const bcrypt = require("bcryptjs");                 // pour chiffrer et vérifier les mots de passe
const Utilisateur = require("../models/utilisateurModel"); // les requêtes SQL des utilisateurs

// POST /api/inscription
async function inscription(req, res) {              // req = la demande reçue, res = la réponse à envoyer
  try {
    const { nom, prenom, email, motDePasse } = req.body || {}; // les champs envoyés par le formulaire (JSON)

    if (!nom || !prenom || !email || !motDePasse) { // 1. un champ est vide
      return res.status(400).json({ message: "Tous les champs sont obligatoires." }); // 400 = demande incorrecte
    }
    if (motDePasse.length < 6) {                    // 2. mot de passe trop court
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
    }
    if (await Utilisateur.trouverParEmail(email)) { // 3. l'email existe déjà dans la base
      return res.status(409).json({ message: "Cet email est déjà utilisé." }); // 409 = conflit
    }
    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10); // 4. chiffre le mot de passe (jamais en clair dans la base)
    const id = await Utilisateur.creer(nom, prenom, email, motDePasseChiffre); // 5. INSERT dans la base

    res.status(201).json({ message: "Compte créé.", utilisateur: { id, nom, prenom, email, role: "membre" } }); // 201 = créé
  } catch (erreur) {                                // une erreur imprévue (base éteinte…)
    console.error(erreur);                          // affichée dans le terminal
    res.status(500).json({ message: "Erreur du serveur." }); // 500 = erreur du serveur
  }
}

// POST /api/connexion
async function connexion(req, res) {
  try {
    const { email, motDePasse } = req.body || {};   // les 2 champs du formulaire de connexion

    if (!email || !motDePasse) {                    // un champ vide
      return res.status(400).json({ message: "Email et mot de passe obligatoires." });
    }
    const utilisateur = await Utilisateur.trouverParEmail(email); // cherche le compte dans la base
    const ok = utilisateur && (await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_util)); // compare le mot de passe tapé avec le chiffré
    if (!ok) {                                      // compte inconnu OU mauvais mot de passe
      return res.status(401).json({ message: "Email ou mot de passe incorrect." }); // même message : on ne dit pas lequel est faux
    }
    const jeton = jwt.sign(                         // crée le jeton (le « bracelet »)
      { id: utilisateur.id_util, role: utilisateur.role_util },   // ce qu'il contient : qui je suis et mon rôle
      process.env.JWT_SECRET,                                     // signé avec la clé secrète du .env (le « tampon »)
      { expiresIn: "8h" }                                         // valable 8 heures
    );

    res.json({                                      // 200 par défaut = tout va bien
      message: "Connexion réussie.",
      jeton,                                        // le navigateur va le garder et le renvoyer à chaque action
      utilisateur: {                                // les infos pour afficher « Bonjour + prénom » (jamais le mot de passe)
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

module.exports = { inscription, connexion };        // partage les 2 fonctions avec les routes