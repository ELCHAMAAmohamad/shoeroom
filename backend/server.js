//C’est le point de départ du serveur, avec une route de test.
// server.js — point de départ du serveur ShoeRoom
require("dotenv").config({ quiet: true }); // lit le fichier .env (en premier)
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());          // autorise les pages HTML à appeler le serveur
app.use(express.json());  // permet de lire le JSON envoyé par les formulaires

// Route de test : vérifie que le serveur est relié à MariaDB
app.get("/api/test", async (req, res) => {
  try {
    const tables = await pool.query("SHOW TABLES");
    res.json({ message: "Serveur relié à MariaDB", nombre_tables: tables.length, tables });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur de connexion à la base", erreur: erreur.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur ShoeRoom lancé sur http://localhost:${PORT}`);
});