// models/annonceModel.js — requêtes SQL sur les annonces et leurs photos (un model = une table)
const pool = require("../db");                                    // la connexion à la base (db.js)

// Liste des annonces EN VENTE, avec des filtres facultatifs (GET /api/annonces)
async function lister(filtres) {                                  // filtres = { marque, size, prixMin, prixMax, etat, q }
  let sql = `
    SELECT a.id_annonce, a.titre_annonce, a.marque_annonce, a.size_annonce,
           a.prix_annonce, a.etat_annonce, a.date_publication_annonce,
           u.prenom_util AS vendeur,
           (SELECT chemin_photo FROM photos_annonces p
             WHERE p.id_annonce_photo = a.id_annonce
             ORDER BY p.id_photo LIMIT 1) AS photo
    FROM annonces a
    JOIN utilisateurs u ON u.id_util = a.id_vendeur_annonce
    WHERE a.statut_annonce = 'en vente'`;                          // JOIN = on ajoute le prénom du vendeur ; la sous-requête prend la 1re photo
  const valeurs = [];                                             // les valeurs des "?", dans l'ordre où on les ajoute

  if (filtres.marque) {                                           // filtre marque rempli ?
    sql += " AND a.marque_annonce LIKE ?";                        // LIKE = « contient » (nike trouve Nike)
    valeurs.push(`%${filtres.marque}%`);                          // % = n'importe quels caractères avant/après
  }
  if (filtres.size) {                                             // filtre pointure rempli ?
    sql += " AND a.size_annonce = ?";                             // pointure exacte
    valeurs.push(filtres.size);
  }
  if (filtres.prixMin) {                                          // prix minimum rempli ?
    sql += " AND a.prix_annonce >= ?";
    valeurs.push(filtres.prixMin);
  }
  if (filtres.prixMax) {                                          // prix maximum rempli ?
    sql += " AND a.prix_annonce <= ?";
    valeurs.push(filtres.prixMax);
  }
  if (filtres.etat) {                                             // état choisi (neuves / occasion) ?
    sql += " AND a.etat_annonce = ?";
    valeurs.push(filtres.etat);
  }
  if (filtres.q) {                                                // mot-clé rempli ? on cherche dans 3 colonnes
    sql += " AND (a.titre_annonce LIKE ? OR a.marque_annonce LIKE ? OR a.description_annonce LIKE ?)";
    valeurs.push(`%${filtres.q}%`, `%${filtres.q}%`, `%${filtres.q}%`); // 3 "?" = 3 valeurs
  }

  sql += " ORDER BY a.date_publication_annonce DESC";             // les plus récentes en premier
  return pool.query(sql, valeurs);                                // exécute la requête construite, avec ses valeurs
}

// Une annonce précise, avec le prénom et le nom du vendeur (GET /api/annonces/:id)
async function trouverParId(id) {
  const lignes = await pool.query(
    `SELECT a.*, u.prenom_util AS vendeur_prenom, u.nom_util AS vendeur_nom
     FROM annonces a
     JOIN utilisateurs u ON u.id_util = a.id_vendeur_annonce
     WHERE a.id_annonce = ?`,                                      // a.* = toutes les colonnes de l'annonce
    [id]
  );
  return lignes[0];                                               // l'annonce, ou undefined si elle n'existe pas
}

// Toutes les photos d'une annonce, dans l'ordre d'ajout (pour la galerie)
async function listerPhotos(idAnnonce) {
  return pool.query(
    "SELECT id_photo, chemin_photo FROM photos_annonces WHERE id_annonce_photo = ? ORDER BY id_photo",
    [idAnnonce]
  );
}

// Enregistrer une nouvelle annonce (le vendeur vient du jeton, pas de la page)
async function creer(annonce, idVendeur) {
  const resultat = await pool.query(
    `INSERT INTO annonces
       (titre_annonce, marque_annonce, size_annonce, prix_annonce,
        etat_annonce, description_annonce, id_vendeur_annonce)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,                                // 7 "?" = 7 valeurs ; statut et date : la base les remplit
    [annonce.titre, annonce.marque, annonce.size, annonce.prix,
     annonce.etat, annonce.description || null, idVendeur]        // description vide -> NULL
  );
  return Number(resultat.insertId);                               // le numéro de la nouvelle annonce
}

// Enregistrer UNE photo liée à une annonce (appelée une fois par photo)
async function ajouterPhoto(idAnnonce, nomFichier) {
  await pool.query(
    "INSERT INTO photos_annonces (chemin_photo, id_annonce_photo) VALUES (?, ?)",
    [nomFichier, idAnnonce]                                       // le nom du fichier rangé dans backend/uploads
  );
}

// Toutes les annonces d'un vendeur, en vente ET vendues (pour « Mon compte »)
async function listerParVendeur(idVendeur) {
  return pool.query(
    `SELECT a.id_annonce, a.titre_annonce, a.marque_annonce, a.size_annonce,
            a.prix_annonce, a.etat_annonce, a.statut_annonce, a.date_publication_annonce,
            (SELECT chemin_photo FROM photos_annonces p
              WHERE p.id_annonce_photo = a.id_annonce
              ORDER BY p.id_photo LIMIT 1) AS photo
     FROM annonces a
     WHERE a.id_vendeur_annonce = ?
     ORDER BY a.date_publication_annonce DESC`,                   // pas de filtre sur le statut : on veut tout
    [idVendeur]
  );
}

module.exports = { lister, trouverParId, listerPhotos, creer, ajouterPhoto, listerParVendeur }; // partagées avec les controllers