// models/annonceModel.js — requêtes SQL sur les annonces et leurs photos
const pool = require("../db");                                     // la connexion à la base

// Liste des annonces EN VENTE, avec des filtres facultatifs
async function lister(filtres) {
  let sql = `
    SELECT a.id_annonce, a.titre_annonce, a.marque_annonce, a.size_annonce,
           a.prix_annonce, a.etat_annonce, a.date_publication_annonce,
           u.prenom_util AS vendeur,
           (SELECT chemin_photo FROM photos_annonces p
             WHERE p.id_annonce_photo = a.id_annonce
             ORDER BY p.id_photo LIMIT 1) AS photo
    FROM annonces a
    JOIN utilisateurs u ON u.id_util = a.id_vendeur_annonce
    WHERE a.statut_annonce = 'en vente'`;                          // seulement les annonces pas encore vendues
  const valeurs = [];                                              // les valeurs qui remplaceront les "?"

  if (filtres.marque) {                                            // filtre marque (ex. "nike" trouve "Nike")
    sql += " AND a.marque_annonce LIKE ?";
    valeurs.push(`%${filtres.marque}%`);
  }
  if (filtres.size) {                                              // filtre pointure exacte
    sql += " AND a.size_annonce = ?";
    valeurs.push(filtres.size);
  }
  if (filtres.prixMin) {                                           // prix minimum
    sql += " AND a.prix_annonce >= ?";
    valeurs.push(filtres.prixMin);
  }
  if (filtres.prixMax) {                                           // prix maximum
    sql += " AND a.prix_annonce <= ?";
    valeurs.push(filtres.prixMax);
  }
  if (filtres.etat) {                                              // "neuves" ou "occasion"
    sql += " AND a.etat_annonce = ?";
    valeurs.push(filtres.etat);
  }
  if (filtres.q) {                                                 // mot-clé dans le titre, la marque ou la description
    sql += " AND (a.titre_annonce LIKE ? OR a.marque_annonce LIKE ? OR a.description_annonce LIKE ?)";
    valeurs.push(`%${filtres.q}%`, `%${filtres.q}%`, `%${filtres.q}%`);
  }

  sql += " ORDER BY a.date_publication_annonce DESC";              // les plus récentes en premier
  return pool.query(sql, valeurs);                                 // exécute la requête préparée
}

// Une annonce précise, avec le vendeur
async function trouverParId(id) {
  const lignes = await pool.query(
    `SELECT a.*, u.prenom_util AS vendeur_prenom, u.nom_util AS vendeur_nom
     FROM annonces a
     JOIN utilisateurs u ON u.id_util = a.id_vendeur_annonce
     WHERE a.id_annonce = ?`,
    [id]
  );
  return lignes[0];                                                // undefined si l'annonce n'existe pas
}

// Toutes les photos d'une annonce
async function listerPhotos(idAnnonce) {
  return pool.query(
    "SELECT id_photo, chemin_photo FROM photos_annonces WHERE id_annonce_photo = ? ORDER BY id_photo",
    [idAnnonce]
  );
}

module.exports = { lister, trouverParId, listerPhotos };