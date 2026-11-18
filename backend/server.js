require("dotenv").config({ quiet: true }); 
const express = require("express");
const path = require("path");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const annonceRoutes = require("./routes/annonceRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());          
app.use(express.json());  

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/test", async (req, res) => {
  try {
    const tables = await pool.query("SHOW TABLES");
    res.json({ message: "Serveur relié à MariaDB", nombre_tables: tables.length, tables });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur de connexion à la base", erreur: erreur.message });
  }
});

app.use("/api", authRoutes); 
app.use("/api", annonceRoutes); 

app.listen(PORT, () => {
  console.log(`Serveur ShoeRoom lancé sur http://localhost:${PORT}`);
});