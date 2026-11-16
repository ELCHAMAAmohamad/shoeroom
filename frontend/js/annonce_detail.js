// js/annonce.js — page annonce.html : afficher le détail d'une annonce

const messagePage = document.getElementById("message-page");    // « Chargement… » ou message d'erreur
const detail = document.getElementById("detail");                // le bloc du détail (caché au départ)

// ===== 1. LIRE LE NUMÉRO DE L'ANNONCE DANS L'ADRESSE =====
// Exemple : annonce_detail.html?id=3  ->  idAnnonce = "3"
const idAnnonce = new URLSearchParams(window.location.search).get("id");

// ===== 2. PETITES FONCTIONS DE FORMATAGE =====
function formaterPrix(prix) {                                    // "65.00" -> "65,00 €"
  return Number(prix).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formaterDate(date) {                                    // "2026-11-16T08:01:47Z" -> "16 novembre 2026"
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function ecrire(id, texte) {                                     // écrit un texte dans l'élément qui a cet id
  document.getElementById(id).textContent = texte;               // textContent = protection XSS
}

// ===== 3. LA GALERIE DE PHOTOS =====
function afficherPhotos(photos, titre) {
  const principale = document.getElementById("photo-principale"); // la grande photo
  const miniatures = document.getElementById("miniatures");       // les petites photos en dessous

  if (photos.length === 0) {                                      // aucune photo
    principale.textContent = "Pas de photo";
    return;
  }

  const grande = document.createElement("img");                   // crée la grande image
  grande.src = "/uploads/" + photos[0].chemin_photo;              // au départ : la première photo
  grande.alt = titre;
  principale.appendChild(grande);

  if (photos.length === 1) return;                                // une seule photo : pas besoin de miniatures

  photos.forEach((photo, index) => {                              // une miniature par photo
    const mini = document.createElement("img");
    mini.src = "/uploads/" + photo.chemin_photo;
    mini.alt = titre + " — photo " + (index + 1);
    if (index === 0) mini.classList.add("active");                // la 1re est sélectionnée
    mini.addEventListener("click", () => {                        // clic sur une miniature :
      grande.src = mini.src;                                      // elle devient la grande photo
      miniatures.querySelectorAll("img").forEach((img) => img.classList.remove("active"));
      mini.classList.add("active");                               // et on la marque comme sélectionnée
    });
    miniatures.appendChild(mini);
  });
}

// ===== 4. LA ZONE D'ACHAT (dépend de qui regarde) =====
function afficherZoneAchat(annonce) {
  const zone = document.getElementById("zone-achat");
  const utilisateur = getUtilisateur();                           // fonction de auth.js (null si pas connecté)

  if (annonce.statut_annonce === "vendue") {                      // déjà vendue
    zone.innerHTML = '<p class="info-achat">Cette paire a déjà été vendue.</p>';
  } else if (!utilisateur) {                                      // visiteur non connecté
    zone.innerHTML = '<a href="connexion.html" class="bouton-principal">Se connecter pour acheter</a>';
  } else if (utilisateur.id === annonce.id_vendeur_annonce) {     // c'est le vendeur lui-même
    zone.innerHTML = '<p class="info-achat">C\'est votre annonce.</p>';
  } else {                                                        // membre connecté : il peut acheter
    zone.innerHTML = '<button class="bouton" id="bouton-acheter">Acheter</button>';
    // Le clic sur « Acheter » sera branché à l'étape suivante (route /api/annonces/:id/acheter)
  }
}

// ===== 5. CHARGER ET AFFICHER L'ANNONCE =====
async function chargerAnnonce() {
  if (!idAnnonce) {                                               // pas de ?id= dans l'adresse
    messagePage.textContent = "Aucune annonce choisie.";
    return;
  }

  try {
    const reponse = await fetch("/api/annonces/" + encodeURIComponent(idAnnonce)); // demande au serveur
    if (reponse.status === 404) {                                 // l'annonce n'existe pas
      messagePage.textContent = "Cette annonce n'existe pas ou a été supprimée.";
      return;
    }
    if (!reponse.ok) throw new Error("Erreur " + reponse.status);
    const annonce = await reponse.json();

    // Remplir les textes
    document.title = annonce.titre_annonce + " — ShoeRoom";       // titre de l'onglet du navigateur
    ecrire("detail-marque", annonce.marque_annonce);
    ecrire("detail-titre", annonce.titre_annonce);
    ecrire("detail-prix", formaterPrix(annonce.prix_annonce));
    ecrire("detail-size", Number(annonce.size_annonce).toLocaleString("fr-FR"));
    ecrire("detail-etat", annonce.etat_annonce === "neuves" ? "Neuves" : "Occasion");
    ecrire("detail-vendeur", annonce.vendeur_prenom);
    ecrire("detail-date", formaterDate(annonce.date_publication_annonce));
    ecrire("detail-description", annonce.description_annonce || "Pas de description.");

    afficherPhotos(annonce.photos, annonce.titre_annonce);        // la galerie
    afficherZoneAchat(annonce);                                   // le bouton ou le message d'achat

    messagePage.hidden = true;                                    // cache « Chargement… »
    detail.hidden = false;                                        // affiche le détail
  } catch (erreur) {
    messagePage.textContent = "Impossible de charger l'annonce.";
  }
}

// ===== 6. AU CHARGEMENT DE LA PAGE =====
chargerAnnonce();