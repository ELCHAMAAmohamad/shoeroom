const pool = require("../db");                                    

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
    WHERE a.statut_annonce = 'en vente'`;                          
  const valeurs = [];                                            

  if (filtres.marque) {                                            
    sql += " AND a.marque_annonce LIKE ?";
    valeurs.push(`%${filtres.marque}%`);
  }
  if (filtres.size) {                                              
    sql += " AND a.size_annonce = ?";
    valeurs.push(filtres.size);
  }
  if (filtres.prixMin) {                                           
    sql += " AND a.prix_annonce >= ?";
    valeurs.push(filtres.prixMin);
  }
  if (filtres.prixMax) {                                           
    sql += " AND a.prix_annonce <= ?";
    valeurs.push(filtres.prixMax);
  }
  if (filtres.etat) {                                              
    sql += " AND a.etat_annonce = ?";
    valeurs.push(filtres.etat);
  }
  if (filtres.q) {                                                 
    sql += " AND (a.titre_annonce LIKE ? OR a.marque_annonce LIKE ? OR a.description_annonce LIKE ?)";
    valeurs.push(`%${filtres.q}%`, `%${filtres.q}%`, `%${filtres.q}%`);
  }

  sql += " ORDER BY a.date_publication_annonce DESC";              
  return pool.query(sql, valeurs);                                
}

async function trouverParId(id) {
  const lignes = await pool.query(
    `SELECT a.*, u.prenom_util AS vendeur_prenom, u.nom_util AS vendeur_nom
     FROM annonces a
     JOIN utilisateurs u ON u.id_util = a.id_vendeur_annonce
     WHERE a.id_annonce = ?`,
    [id]
  );
  return lignes[0];                                               
}

async function listerPhotos(idAnnonce) {
  return pool.query(
    "SELECT id_photo, chemin_photo FROM photos_annonces WHERE id_annonce_photo = ? ORDER BY id_photo",
    [idAnnonce]
  );
}

async function creer(annonce, idVendeur) {
  const resultat = await pool.query(
    `INSERT INTO annonces
       (titre_annonce, marque_annonce, size_annonce, prix_annonce,
        etat_annonce, description_annonce, id_vendeur_annonce)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,                                
    [annonce.titre, annonce.marque, annonce.size, annonce.prix,
     annonce.etat, annonce.description || null, idVendeur]        
  );
  return Number(resultat.insertId);                               
}

async function ajouterPhoto(idAnnonce, nomFichier) {
  await pool.query(
    "INSERT INTO photos_annonces (chemin_photo, id_annonce_photo) VALUES (?, ?)",
    [nomFichier, idAnnonce]                                        
  );
}

async function listerParVendeur(idVendeur) {
  return pool.query(
    `SELECT a.id_annonce, a.titre_annonce, a.marque_annonce, a.size_annonce,
            a.prix_annonce, a.etat_annonce, a.statut_annonce, a.date_publication_annonce,
            (SELECT chemin_photo FROM photos_annonces p
              WHERE p.id_annonce_photo = a.id_annonce
              ORDER BY p.id_photo LIMIT 1) AS photo
     FROM annonces a
     WHERE a.id_vendeur_annonce = ?
     ORDER BY a.date_publication_annonce DESC`,                   
    [idVendeur]
  );
}




module.exports = { lister, trouverParId, listerPhotos, creer, ajouterPhoto,listerParVendeur};