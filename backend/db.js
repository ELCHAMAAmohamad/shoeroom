// db.js — connexion à la base MariaDB (utilisée par tous les models)
const mariadb = require("mariadb");                 // la bibliothèque qui sait parler à MariaDB (installée avec npm)

// Un "pool" = quelques connexions ouvertes à l'avance, réutilisées à chaque demande (plus rapide)
const pool = mariadb.createPool({
  host: process.env.DB_HOST,                        // adresse de la base, lue dans .env (localhost)
  port: process.env.DB_PORT,                        // porte de la base (3306)
  user: process.env.DB_USER,                        // utilisateur (root)
  password: process.env.DB_PASSWORD,                // mot de passe (vide avec XAMPP)
  database: process.env.DB_NAME,                    // nom de la base (shoeroom)
  connectionLimit: 5,                               // 5 connexions maximum en même temps
});

module.exports = pool;                              // on « exporte » le pool : les models le récupèrent avec require("../db")