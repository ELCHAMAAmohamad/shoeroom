// models/utilisateurModel.js — requêtes SQL sur la table utilisateurs
const pool = require("../db");

// Cherche un utilisateur par son email (renvoie undefined s'il n'existe pas)
async function trouverParEmail(email) {
  const lignes = await pool.query(
    "SELECT * FROM utilisateurs WHERE email_util = ?",[email]);
  return lignes[0];
}

// Crée un utilisateur et renvoie son id
async function creer(nom, email, motDePasseChiffre) {
  const resultat = await pool.query(
    "INSERT INTO utilisateurs (nom_util, email_util, mot_de_passe_util) VALUES (?, ?, ?)",[nom, email, motDePasseChiffre]
  );
  return Number(resultat.insertId);
}
//module.exports partage les fonctions avec les autres fichiers ;
module.exports = { trouverParEmail, creer };