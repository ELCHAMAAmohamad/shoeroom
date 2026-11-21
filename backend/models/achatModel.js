
const pool = require("../db");                                    

async function acheter(idAnnonce, idAcheteur) {
  const conn = await pool.getConnection();                         
  try {
    await conn.beginTransaction();                                 

    const resultat = await conn.query(
      "UPDATE annonces SET statut_annonce = 'vendue' WHERE id_annonce = ? AND statut_annonce = 'en vente'",
      [idAnnonce]
    );
    if (resultat.affectedRows === 0) {                             
      await conn.rollback();                                       
      return false;
    }

    await conn.query(
      "INSERT INTO achats (id_annonce_achat, id_acheteur_achat) VALUES (?, ?)",
      [idAnnonce, idAcheteur]
    );

    await conn.commit();                                      
    return true;
  } catch (erreur) {
    await conn.rollback();                                         
    throw erreur;                                                  
  } finally {
    conn.release();                                                
  }
}

async function listerParAcheteur(idAcheteur) {
  return pool.query(
    `SELECT ac.id_achat, ac.date_achat,
            a.id_annonce, a.titre_annonce, a.marque_annonce, a.size_annonce, a.prix_annonce,
            u.prenom_util AS vendeur,
            (SELECT chemin_photo FROM photos_annonces p
              WHERE p.id_annonce_photo = a.id_annonce
              ORDER BY p.id_photo LIMIT 1) AS photo
     FROM achats ac
     JOIN annonces a ON a.id_annonce = ac.id_annonce_achat
     JOIN utilisateurs u ON u.id_util = a.id_vendeur_annonce
     WHERE ac.id_acheteur_achat = ?
     ORDER BY ac.date_achat DESC`,                                
    [idAcheteur]
  );
}
module.exports = { acheter, listerParAcheteur };