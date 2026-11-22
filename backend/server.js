// server.js — le point de départ : on lance ce fichier avec "npm run dev"
require("dotenv").config({ quiet: true });          // lit le fichier .env et range ses valeurs dans process.env
const express = require("express");                 // Express : la bibliothèque qui crée le serveur Web
const path = require("path");                       // outil de Node pour construire des chemins de dossiers
const cors = require("cors");                       // autorise le navigateur à appeler notre API
const pool = require("./db");                       // la connexion à la base (fichier db.js)
const authRoutes = require("./routes/authRoutes");       // les adresses des comptes (/api/inscription…)
const annonceRoutes = require("./routes/annonceRoutes"); // les adresses des annonces (/api/annonces…)
const compteRoutes = require("./routes/compteRoutes");   // les adresses de « Mon compte » (/api/moi/…)

const app = express();                              // on crée l'application serveur
const PORT = process.env.PORT || 3000;              // le port lu dans .env, sinon 3000

app.use(cors());                                    // middleware : accepte les appels venant du navigateur
app.use(express.json());                            // middleware : lit le JSON envoyé par fetch et le range dans req.body

app.use(express.static(path.join(__dirname, "..", "frontend")));        // sert les pages du dossier frontend (index.html, css, js…)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));   // sert les photos : /uploads/photo.jpg → backend/uploads/photo.jpg

// Route de test : vérifie que le serveur arrive bien à parler à la base
app.get("/api/test", async (req, res) => {          // quand on ouvre http://localhost:3000/api/test
  try {
    const tables = await pool.query("SHOW TABLES"); // demande à MariaDB la liste des tables
    res.json({ message: "Serveur relié à MariaDB", nombre_tables: tables.length, tables }); // répond en JSON
  } catch (erreur) {                                // si la base ne répond pas (XAMPP éteint…)
    console.error(erreur);                          // affiche l'erreur dans le terminal
    res.status(500).json({ message: "Erreur de connexion à la base", erreur: erreur.message }); // 500 = erreur du serveur
  }
});

app.use("/api", authRoutes);                        // branche les routes des comptes, toutes préfixées par /api
app.use("/api", annonceRoutes);                     // branche les routes des annonces
app.use("/api", compteRoutes);                      // branche les routes de « Mon compte »

app.listen(PORT, () => {                            // démarre le serveur : il attend les demandes sur le port 3000
  console.log(`Serveur ShoeRoom lancé sur http://localhost:${PORT}`); // le message que vous voyez dans le terminal
});