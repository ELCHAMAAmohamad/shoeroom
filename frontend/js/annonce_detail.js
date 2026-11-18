// js/annonce_detail.js — page annonce_detail.html : afficher le détail d'une annonce

const messagePage = document.getElementById("message-page");    // « Chargement… » ou message d'erreur
const detail = document.getElementById("detail");                // le bloc du détail (caché au départ)

// ===== 1. LIRE LE NUMÉRO DE L'ANNONCE DANS L'ADRESSE =====
// Exemple : annonce.html?id=3  ->  idAnnonce = "3"
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
  const utilisateur = getUtilisateur();                           // vient de auth.js (null si pas connecté)

  if (annonce.statut_annonce === "vendue") {                      // déjà vendue
    zone.innerHTML = '<p class="info-achat">Cette paire a déjà été vendue.</p>';
  } else if (!utilisateur) {                                      // visiteur non connecté
    zone.innerHTML = '<a href="connexion.html" class="bouton-principal">Se connecter pour acheter</a>';
  } else if (utilisateur.id === annonce.id_vendeur_annonce) {     // c'est le vendeur lui-même
    zone.innerHTML = '<p class="info-achat">C\'est votre annonce.</p>';
  } else {                                                        // membre connecté : il peut acheter
    afficherBoutonAcheter(annonce);
  }
}

// ===== 5. ACHETER EN 2 CLICS : « Acheter » puis « Confirmer » =====
function afficherBoutonAcheter(annonce) {
  const zone = document.getElementById("zone-achat");
  zone.innerHTML = '<button class="bouton" id="bouton-acheter">Acheter</button>';
  document.getElementById("bouton-acheter").addEventListener("click", () => demanderConfirmation(annonce));
}

function demanderConfirmation(annonce) {                          // 2e étape : éviter un achat par erreur
  const zone = document.getElementById("zone-achat");
  zone.innerHTML = `
    <p class="question-achat" id="question-achat"></p>
    <div class="boutons-achat">
      <button class="bouton" id="bouton-confirmer">Confirmer l'achat</button>
      <button class="bouton-lien" id="bouton-annuler">Annuler</button>
    </div>
    <p class="message" id="message"></p>
  `;
  document.getElementById("question-achat").textContent =        // textContent = protection XSS
    "Acheter « " + annonce.titre_annonce + " » pour " + formaterPrix(annonce.prix_annonce) + " ?";
  document.getElementById("bouton-annuler").addEventListener("click", () => afficherBoutonAcheter(annonce));
  document.getElementById("bouton-confirmer").addEventListener("click", () => acheter(annonce));
}

async function acheter(annonce) {                                 // 3e étape : envoyer l'achat au serveur
  const bouton = document.getElementById("bouton-confirmer");
  bouton.disabled = true;                                         // pas de double achat

  try {
    const reponse = await fetch("/api/annonces/" + annonce.id_annonce + "/acheter", {
      method: "POST",
      headers: { Authorization: "Bearer " + getJeton() },         // le jeton dit au serveur QUI achète
    });
    const resultat = await reponse.json();

    if (reponse.status === 201) {                                 // achat confirmé
      document.getElementById("zone-achat").innerHTML =
        '<p class="info-achat succes-achat">Achat confirmé ! Cette paire est à vous.</p>';
    } else if (reponse.status === 401) {                          // jeton absent ou expiré
      afficherMessage(resultat.message + " Redirection…", "erreur");
      setTimeout(deconnexion, 1500);
    } else {                                                      // 403 ou 409 : refusé par le serveur
      afficherMessage(resultat.message, "erreur");
    }
  } catch (erreur) {
    afficherMessage("Impossible de joindre le serveur.", "erreur");
    bouton.disabled = false;
  }
}

// ===== 6. CHARGER ET AFFICHER L'ANNONCE =====
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

// ===== 7. AU CHARGEMENT DE LA PAGE =====
chargerAnnonce();