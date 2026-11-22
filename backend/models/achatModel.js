// models/achatModel.js — requêtes SQL sur les achats
const pool = require("../db");                                    // la connexion à la base (db.js)

async function acheter(idAnnonce, idAcheteur) {                   // acheter = 2 changements qui doivent réussir ENSEMBLE
  const conn = await pool.getConnection();                        // une connexion à nous seuls, le temps de la transaction
  try {                                                           // essaie…
    await conn.beginTransaction();                                // début de la transaction : rien n'est encore définitif

    const resultat = await conn.query(                            // 1. passer l'annonce à « vendue »…
      "UPDATE annonces SET statut_annonce = 'vendue' WHERE id_annonce = ? AND statut_annonce = 'en vente'", // …SEULEMENT si elle est encore en vente
      [idAnnonce]
    );
    if (resultat.affectedRows === 0) {                            // 0 ligne changée = quelqu'un l'a achetée juste avant
      await conn.rollback();                                      // on annule tout
      return false;                                               // le controller répondra 409 « déjà vendue »
    }

    await conn.query(                                             // 2. garder la trace de l'achat
      "INSERT INTO achats (id_annonce_achat, id_acheteur_achat) VALUES (?, ?)", // qui a acheté quelle annonce (la date se met toute seule)
      [idAnnonce, idAcheteur]
    );

    await conn.commit();                                          // fin : les 2 changements deviennent définitifs
    return true;                                                  // achat réussi
  } catch (erreur) {                                              // une erreur pendant la transaction…
    await conn.rollback();                                        // …on annule les 2 changements
    throw erreur;                                                 // le controller affichera « Erreur du serveur »
  } finally {                                                     // dans TOUS les cas (réussite ou erreur) :
    conn.release();                                               // on rend la connexion au pool
  }
}

async function listerParAcheteur(idAcheteur) {                    // tous les achats d'un membre (pour « Mon compte »)
  return pool.query(
    `SELECT ac.id_achat, ac.date_achat,                           -- infos de l'achat (numéro, date)…
            a.id_annonce, a.titre_annonce, a.marque_annonce, a.size_annonce, a.prix_annonce, -- …infos de l'annonce achetée…
            u.prenom_util AS vendeur,                             -- …prénom du vendeur…
            (SELECT chemin_photo FROM photos_annonces p           -- …et sa 1re photo (sous-requête)
              WHERE p.id_annonce_photo = a.id_annonce
              ORDER BY p.id_photo LIMIT 1) AS photo
     FROM achats ac                                               -- on part de la table achats
     JOIN annonces a ON a.id_annonce = ac.id_annonce_achat        -- JOIN 1 : achat -> l'annonce achetée
     JOIN utilisateurs u ON u.id_util = a.id_vendeur_annonce      -- JOIN 2 : annonce -> son vendeur
     WHERE ac.id_acheteur_achat = ?                               -- seulement les achats de ce membre
     ORDER BY ac.date_achat DESC`,                                // les achats les plus récents en premier
    [idAcheteur]
  );
}
module.exports = { acheter, listerParAcheteur };                  // partagées avec les controllers