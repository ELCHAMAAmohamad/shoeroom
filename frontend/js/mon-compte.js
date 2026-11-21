// js/mon-compte.js — page mon-compte.html : mes annonces et mes achats

// ===== 1. PAGE RÉSERVÉE AUX MEMBRES CONNECTÉS =====
const moi = getUtilisateur();                                    // vient de auth.js (null si pas connecté)
if (!moi) {
  window.location.replace("connexion.html");                     // pas connecté : on va à la connexion
}

// ===== 2. PETITES FONCTIONS DE FORMATAGE =====
function formaterPrix(prix) {                                    // "50.00" -> "50,00 €"
  return Number(prix).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formaterDate(date) {                                    // date SQL -> "18 novembre 2026"
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ===== 3. FABRIQUER UNE CARTE (même style que la liste des annonces) =====
function creerCarte(annonce, badgeTexte, badgeClasse, details) {
  const carte = document.createElement("a");                     // toute la carte est un lien
  carte.className = "carte-annonce";
  carte.href = "annonce_detail.html?id=" + annonce.id_annonce;   // clic -> page de détail

  const zonePhoto = document.createElement("div");               // la photo (ou « Pas de photo »)
  zonePhoto.className = "carte-photo";
  if (annonce.photo) {
    const img = document.createElement("img");
    img.src = "/uploads/" + annonce.photo;
    img.alt = annonce.titre_annonce;
    zonePhoto.appendChild(img);
  } else {
    zonePhoto.textContent = "Pas de photo";
  }

  const badge = document.createElement("span");                  // « En vente », « Vendue » ou « Achetée »
  badge.className = "badge " + badgeClasse;
  badge.textContent = badgeTexte;
  zonePhoto.appendChild(badge);

  const infos = document.createElement("div");                   // les textes (textContent = protection XSS)
  infos.className = "carte-infos";
  const marque = document.createElement("p");
  marque.className = "carte-marque";
  marque.textContent = annonce.marque_annonce;
  const titre = document.createElement("h3");
  titre.textContent = annonce.titre_annonce;
  const ligne = document.createElement("p");
  ligne.className = "carte-details";
  ligne.textContent = details;
  const prix = document.createElement("p");
  prix.className = "carte-prix";
  prix.textContent = formaterPrix(annonce.prix_annonce);

  infos.append(marque, titre, ligne, prix);
  carte.append(zonePhoto, infos);
  return carte;
}

// ===== 4. DEMANDER UNE LISTE AU SERVEUR (avec le jeton) =====
async function chargerListe(adresse) {
  const reponse = await fetch(adresse, {
    headers: { Authorization: "Bearer " + getJeton() },          // le jeton dit au serveur QUI je suis
  });
  if (reponse.status === 401) {                                  // jeton expiré : on repart de zéro
    deconnexion();
    throw new Error("Session expirée");
  }
  if (!reponse.ok) throw new Error("Erreur " + reponse.status);
  return reponse.json();
}

// ===== 5. MES ANNONCES =====
async function afficherMesAnnonces() {
  const grille = document.getElementById("grille-mes-annonces");
  const resume = document.getElementById("resume-annonces");
  try {
    const annonces = await chargerListe("/api/moi/annonces");
    document.getElementById("nb-annonces").textContent = "(" + annonces.length + ")";

    if (annonces.length === 0) {                                 // aucune annonce : on invite à vendre
      resume.textContent = "Vous n'avez pas encore publié d'annonce.";
      return;
    }
    const enVente = annonces.filter((a) => a.statut_annonce === "en vente").length; // compte les annonces en vente
    resume.textContent = enVente + " en vente · " + (annonces.length - enVente) + " vendue(s)";

    annonces.forEach((a) => {                                    // une carte par annonce
      const vendue = a.statut_annonce === "vendue";
      const details = "Pointure " + Number(a.size_annonce).toLocaleString("fr-FR") + " · publiée le " + formaterDate(a.date_publication_annonce);
      grille.appendChild(creerCarte(a, vendue ? "Vendue" : "En vente", vendue ? "badge-vendue" : "badge-neuves", details));
    });
  } catch (erreur) {
    resume.textContent = "Impossible de charger vos annonces.";
  }
}

// ===== 6. MES ACHATS =====
async function afficherMesAchats() {
  const grille = document.getElementById("grille-mes-achats");
  const resume = document.getElementById("resume-achats");
  try {
    const achats = await chargerListe("/api/moi/achats");
    document.getElementById("nb-achats").textContent = "(" + achats.length + ")";

    if (achats.length === 0) {                                   // aucun achat
      resume.textContent = "Vous n'avez encore rien acheté.";
      return;
    }
    resume.textContent = achats.length + (achats.length > 1 ? " achats" : " achat");

    achats.forEach((a) => {                                      // une carte par achat
      const details = "Achetée le " + formaterDate(a.date_achat) + " · vendue par " + a.vendeur;
      grille.appendChild(creerCarte(a, "Achetée", "badge-achetee", details));
    });
  } catch (erreur) {
    resume.textContent = "Impossible de charger vos achats.";
  }
}

// ===== 7. LES ONGLETS =====
function choisirOnglet(nom) {                                    // nom = "annonces" ou "achats"
  ["annonces", "achats"].forEach((n) => {
    const actif = n === nom;
    document.getElementById("onglet-" + n).classList.toggle("actif", actif);   // style de l'onglet choisi
    document.getElementById("onglet-" + n).setAttribute("aria-selected", actif); // accessibilité
    document.getElementById("panneau-" + n).hidden = !actif;     // montre une partie, cache l'autre
  });
}

document.getElementById("onglet-annonces").addEventListener("click", () => choisirOnglet("annonces"));
document.getElementById("onglet-achats").addEventListener("click", () => choisirOnglet("achats"));

// ===== 8. AU CHARGEMENT DE LA PAGE =====
if (moi) {
  document.getElementById("infos-compte").textContent = moi.prenom + " " + moi.nom + " · " + moi.email; // textContent = protection XSS
  afficherMesAnnonces();
  afficherMesAchats();
}