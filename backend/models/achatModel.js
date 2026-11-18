
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

module.exports = { acheter };