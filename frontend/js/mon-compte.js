// js/mon-compte.js — page mon-compte.html : mes annonces et mes achats

// ===== 1. PAGE RÉSERVÉE AUX MEMBRES CONNECTÉS =====
const moi = getUtilisateur();                                    // vient de auth.js (null si pas connecté)
if (!moi) {                                                       // personne de connecté ?
  window.location.replace("connexion.html");                     // pas connecté : on va à la connexion
}

// ===== 2. PETITES FONCTIONS DE FORMATAGE =====
function formaterPrix(prix) {                                    // "50.00" -> "50,00 €"
  return Number(prix).toLocaleString("fr-FR", { style: "currency", currency: "EUR" }); // "50.00" -> "50,00 €"
}

function formaterDate(date) {                                    // date SQL -> "18 novembre 2026"
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); // date SQL -> « 18 novembre 2026 »
}

// ===== 3. FABRIQUER UNE CARTE (même style que la liste des annonces) =====
function creerCarte(annonce, badgeTexte, badgeClasse, details) {  // même carte que la liste, avec un badge et une ligne au choix
  const carte = document.createElement("a");                     // toute la carte est un lien
  carte.className = "carte-annonce";                              // style de carte (style.css)
  carte.href = "annonce_detail.html?id=" + annonce.id_annonce;   // clic -> page de détail

  const zonePhoto = document.createElement("div");               // la photo (ou « Pas de photo »)
  zonePhoto.className = "carte-photo";                            // style de la zone photo
  if (annonce.photo) {                                            // l'annonce a une photo ?
    const img = document.createElement("img");                    // crée une image
    img.src = "/uploads/" + annonce.photo;                        // les photos sont servies par /uploads
    img.alt = annonce.titre_annonce;                              // texte alternatif (accessibilité)
    zonePhoto.appendChild(img);                                   // place l'image
  } else {                                                        // pas de photo :
    zonePhoto.textContent = "Pas de photo";                       // on écrit un texte à la place
  }

  const badge = document.createElement("span");                  // « En vente », « Vendue » ou « Achetée »
  badge.className = "badge " + badgeClasse;                       // badge-neuves (vert), badge-vendue (noir) ou badge-achetee (camel)
  badge.textContent = badgeTexte;                                 // « En vente », « Vendue » ou « Achetée »
  zonePhoto.appendChild(badge);                                   // place le badge sur la photo

  const infos = document.createElement("div");                   // les textes (textContent = protection XSS)
  infos.className = "carte-infos";                                // style de la zone texte
  const marque = document.createElement("p");                     // paragraphe pour la marque
  marque.className = "carte-marque";                              // style : petites majuscules camel
  marque.textContent = annonce.marque_annonce;                    // écrit la marque
  const titre = document.createElement("h3");                     // titre de la carte
  titre.textContent = annonce.titre_annonce;                      // écrit le titre
  const ligne = document.createElement("p");                      // paragraphe pour la ligne de détails
  ligne.className = "carte-details";                              // style : texte gris
  ligne.textContent = details;                                    // « Pointure 42 · publiée le … » ou « Achetée le … »
  const prix = document.createElement("p");                       // paragraphe pour le prix
  prix.className = "carte-prix";                                  // style : gros et gras
  prix.textContent = formaterPrix(annonce.prix_annonce);          // « 50,00 € »

  infos.append(marque, titre, ligne, prix);                       // ajoute les 4 textes
  carte.append(zonePhoto, infos);                                 // assemble la carte
  return carte;                                                   // renvoie la carte terminée
}

// ===== 4. DEMANDER UNE LISTE AU SERVEUR (avec le jeton) =====
async function chargerListe(adresse) {                            // une seule fonction pour les 2 listes
  const reponse = await fetch(adresse, {                          // envoie la demande au serveur…
    headers: { Authorization: "Bearer " + getJeton() },          // le jeton dit au serveur QUI je suis
  });
  if (reponse.status === 401) {                                  // jeton expiré : on repart de zéro
    deconnexion();                                                // efface la session (auth.js)
    throw new Error("Session expirée");                           // arrête la suite (va dans catch)
  }
  if (!reponse.ok) throw new Error("Erreur " + reponse.status);   // autre erreur (500…)
  return reponse.json();                                          // renvoie la liste en JSON
}

// ===== 5. MES ANNONCES =====
async function afficherMesAnnonces() {                            // remplit l'onglet « Mes annonces »
  const grille = document.getElementById("grille-mes-annonces");  // la grille des cartes
  const resume = document.getElementById("resume-annonces");      // le texte « 1 en vente · 1 vendue(s) »
  try {                                                           // essaie…
    const annonces = await chargerListe("/api/moi/annonces");     // demande mes annonces au serveur
    document.getElementById("nb-annonces").textContent = "(" + annonces.length + ")"; // le nombre dans l'onglet : (2)

    if (annonces.length === 0) {                                 // aucune annonce : on invite à vendre
      resume.textContent = "Vous n'avez pas encore publié d'annonce."; // message quand la liste est vide
      return;                                                     // on s'arrête
    }
    const enVente = annonces.filter((a) => a.statut_annonce === "en vente").length; // compte les annonces en vente
    resume.textContent = enVente + " en vente · " + (annonces.length - enVente) + " vendue(s)"; // « 1 en vente · 1 vendue(s) »

    annonces.forEach((a) => {                                    // une carte par annonce
      const vendue = a.statut_annonce === "vendue";               // true si l'annonce est vendue
      const details = "Pointure " + Number(a.size_annonce).toLocaleString("fr-FR") + " · publiée le " + formaterDate(a.date_publication_annonce); // « Pointure 42 · publiée le 18 novembre 2026 »
      grille.appendChild(creerCarte(a, vendue ? "Vendue" : "En vente", vendue ? "badge-vendue" : "badge-neuves", details)); // ajoute la carte avec le bon badge
    });
  } catch (erreur) {                                              // …si ça échoue
    resume.textContent = "Impossible de charger vos annonces.";   // message clair
  }
}

// ===== 6. MES ACHATS =====
async function afficherMesAchats() {                              // remplit l'onglet « Mes achats »
  const grille = document.getElementById("grille-mes-achats");    // la grille des cartes
  const resume = document.getElementById("resume-achats");        // le texte « 1 achat »
  try {                                                           // essaie…
    const achats = await chargerListe("/api/moi/achats");         // demande mes achats au serveur
    document.getElementById("nb-achats").textContent = "(" + achats.length + ")"; // le nombre dans l'onglet : (1)

    if (achats.length === 0) {                                   // aucun achat
      resume.textContent = "Vous n'avez encore rien acheté.";     // message quand la liste est vide
      return;                                                     // on s'arrête
    }
    resume.textContent = achats.length + (achats.length > 1 ? " achats" : " achat"); // « 1 achat » ou « 3 achats »

    achats.forEach((a) => {                                      // une carte par achat
      const details = "Achetée le " + formaterDate(a.date_achat) + " · vendue par " + a.vendeur; // « Achetée le … · vendue par … »
      grille.appendChild(creerCarte(a, "Achetée", "badge-achetee", details)); // ajoute la carte avec le badge « Achetée »
    });
  } catch (erreur) {                                              // …si ça échoue
    resume.textContent = "Impossible de charger vos achats.";     // message clair
  }
}

// ===== 7. LES ONGLETS =====
function choisirOnglet(nom) {                                    // nom = "annonces" ou "achats"
  ["annonces", "achats"].forEach((n) => {                         // pour chacun des 2 onglets…
    const actif = n === nom;                                      // true pour l'onglet cliqué
    document.getElementById("onglet-" + n).classList.toggle("actif", actif);   // style de l'onglet choisi
    document.getElementById("onglet-" + n).setAttribute("aria-selected", actif); // accessibilité
    document.getElementById("panneau-" + n).hidden = !actif;     // montre une partie, cache l'autre
  });
}

document.getElementById("onglet-annonces").addEventListener("click", () => choisirOnglet("annonces")); // clic sur « Mes annonces »
document.getElementById("onglet-achats").addEventListener("click", () => choisirOnglet("achats")); // clic sur « Mes achats »

// ===== 8. AU CHARGEMENT DE LA PAGE =====
if (moi) {                                                        // seulement si quelqu'un est connecté
  document.getElementById("infos-compte").textContent = moi.prenom + " " + moi.nom + " · " + moi.email; // textContent = protection XSS
  afficherMesAnnonces();                                          // charge l'onglet 1
  afficherMesAchats();                                            // charge l'onglet 2
}