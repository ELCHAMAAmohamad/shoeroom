// models/utilisateurModel.js — requêtes SQL sur la table utilisateurs (un model = une table)
const pool = require("../db");                      // la connexion à la base (db.js)

// Cherche un utilisateur par son email (renvoie undefined s'il n'existe pas)
async function trouverParEmail(email) {             // async = la fonction attend la réponse de la base
  const lignes = await pool.query(
    "SELECT * FROM utilisateurs WHERE email_util = ?", [email]); // "?" sera remplacé par email, en toute sécurité (pas d'injection SQL)
  return lignes[0];                                 // la 1re ligne trouvée (un email est unique, donc 0 ou 1 ligne)
}

// Crée un utilisateur et renvoie son id
async function creer(nom, prenom, email, motDePasseChiffre) {
  const resultat = await pool.query(
    "INSERT INTO utilisateurs (nom_util, prenom_util, email_util, mot_de_passe_util) VALUES (?, ?, ?, ?)", // 4 "?" = 4 valeurs
    [nom, prenom, email, motDePasseChiffre]        // les valeurs, dans le même ordre que les colonnes
  );                                                // role et date ne sont pas envoyés : la base met « membre » et la date du jour
  return Number(resultat.insertId);                 // insertId = le numéro (id_util) que MariaDB vient de donner
}

module.exports = { trouverParEmail, creer };        // partage les 2 fonctions avec le controller