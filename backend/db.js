//pour gere la connexion avec mariaDB 
// db.js — connexion à la base MariaDB
const mariadb = require("mariadb");

// Un "pool" garde quelques connexions ouvertes et les réutilise
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

module.exports = pool;