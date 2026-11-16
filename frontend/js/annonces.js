// js/annonces.js — page annonces.html : charger, filtrer et afficher les annonces

const grille = document.getElementById("grille-annonces");      // la zone où on affiche les cartes
const compteur = document.getElementById("compteur");           // le texte « 4 annonces »
const formFiltres = document.getElementById("form-filtres");    // le formulaire des filtres

// ===== 1. LIRE LES FILTRES REMPLIS =====
function lireFiltres() {                                         // renvoie les filtres remplis par l'utilisateur
  const filtres = {};                                            // objet vide au départ
  ["q", "marque", "size", "prixMin", "prixMax", "etat"].forEach((id) => { // pour chaque champ du formulaire
    const valeur = document.getElementById(id).value.trim();     // lit ce qui est écrit
    if (valeur !== "") filtres[id] = valeur;                     // on garde seulement les champs remplis
  });
  return filtres;                                                // ex. { marque: "nike", size: "42" }
}

// ===== 2. DEMANDER LES ANNONCES AU SERVEUR =====
async function chargerAnnonces() {                               // va chercher les annonces et les affiche
  compteur.textContent = "Chargement…";                          // message pendant l'attente
  const parametres = new URLSearchParams(lireFiltres());         // { marque: "nike" } -> "marque=nike"

  try {
    const reponse = await fetch("/api/annonces?" + parametres);  // demande à la « cuisine » (le serveur)
    if (!reponse.ok) throw new Error("Erreur " + reponse.status);  // le serveur a répondu une erreur (ex. base arrêtée)
    const annonces = await reponse.json();                       // lit la liste reçue
    afficherAnnonces(annonces);                                  // fabrique les cartes
  } catch (erreur) {                                             // le serveur ne répond pas
    compteur.textContent = "Impossible de charger les annonces.";
  }
}

// ===== 3. FORMATER LE PRIX ET LA POINTURE =====
function formaterPrix(prix) {                                    // "65.00" -> "65,00 €"
  return Number(prix).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formaterSize(size) {                                    // "42.0" -> "42" ; "42.5" -> "42,5"
  return Number(size).toLocaleString("fr-FR");
}

// ===== 4. FABRIQUER UNE CARTE POUR UNE ANNONCE =====
function creerCarte(annonce) {                                   // renvoie un élément <a> prêt à afficher
  const carte = document.createElement("a");                     // toute la carte est un lien
  carte.className = "carte-annonce";
  carte.href = "annonce.html?id=" + annonce.id_annonce;          // clic -> page de détail de cette annonce

  // Photo (ou un cadre « Pas de photo »)
  const zonePhoto = document.createElement("div");
  zonePhoto.className = "carte-photo";
  if (annonce.photo) {                                           // l'annonce a au moins une photo
    const img = document.createElement("img");
    img.src = "/uploads/" + annonce.photo;                       // les photos sont dans backend/uploads
    img.alt = annonce.titre_annonce;                             // texte alternatif (accessibilité)
    zonePhoto.appendChild(img);
  } else {
    zonePhoto.textContent = "Pas de photo";
  }

  // Badge « Neuves » ou « Occasion »
  const badge = document.createElement("span");
  badge.className = "badge " + (annonce.etat_annonce === "neuves" ? "badge-neuves" : "badge-occasion");
  badge.textContent = annonce.etat_annonce === "neuves" ? "Neuves" : "Occasion";
  zonePhoto.appendChild(badge);

  // Textes de la carte (textContent = jamais exécuté comme du code : protection XSS)
  const infos = document.createElement("div");
  infos.className = "carte-infos";

  const marque = document.createElement("p");
  marque.className = "carte-marque";
  marque.textContent = annonce.marque_annonce;

  const titre = document.createElement("h3");
  titre.textContent = annonce.titre_annonce;

  const details = document.createElement("p");
  details.className = "carte-details";
  details.textContent = "Pointure " + formaterSize(annonce.size_annonce) + " · vendu par " + annonce.vendeur;

  const prix = document.createElement("p");
  prix.className = "carte-prix";
  prix.textContent = formaterPrix(annonce.prix_annonce);

  infos.append(marque, titre, details, prix);                    // ajoute les 4 textes dans la zone infos
  carte.append(zonePhoto, infos);                                // assemble la carte
  return carte;
}

// ===== 5. AFFICHER TOUTES LES CARTES =====
function afficherAnnonces(annonces) {
  grille.innerHTML = "";                                         // vide l'ancienne liste

  if (annonces.length === 0) {                                   // aucun résultat
    compteur.textContent = "Aucune annonce ne correspond à votre recherche.";
    return;
  }

  compteur.textContent = annonces.length + (annonces.length > 1 ? " annonces" : " annonce"); // « 1 annonce » / « 4 annonces »
  annonces.forEach((annonce) => grille.appendChild(creerCarte(annonce))); // une carte par annonce
}

// ===== 6. LES BOUTONS DES FILTRES =====
formFiltres.addEventListener("submit", (evenement) => {          // clic sur « Appliquer »
  evenement.preventDefault();                                    // pas de rechargement de la page
  chargerAnnonces();                                             // recharge avec les filtres
});

document.getElementById("reinitialiser").addEventListener("click", () => { // clic sur « Réinitialiser »
  formFiltres.reset();                                           // vide tous les champs
  chargerAnnonces();                                             // recharge toutes les annonces
});

// ===== 7. AU CHARGEMENT DE LA PAGE =====
chargerAnnonces();                                               // affiche toutes les annonces dès l'ouverture