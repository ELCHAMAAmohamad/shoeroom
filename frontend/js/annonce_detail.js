// js/annonce_detail.js — page annonce_detail.html : afficher le détail d'une annonce

const messagePage = document.getElementById("message-page");    // « Chargement… » ou message d'erreur
const detail = document.getElementById("detail");                // le bloc du détail (caché au départ)

// ===== 1. LIRE LE NUMÉRO DE L'ANNONCE DANS L'ADRESSE =====
// Exemple : annonce.html?id=3  ->  idAnnonce = "3"
const idAnnonce = new URLSearchParams(window.location.search).get("id"); // lit ?id=3 dans l'adresse -> "3" (null s'il n'y en a pas)

// ===== 2. PETITES FONCTIONS DE FORMATAGE =====
function formaterPrix(prix) {                                    // "65.00" -> "65,00 €"
  return Number(prix).toLocaleString("fr-FR", { style: "currency", currency: "EUR" }); // "85.00" -> "85,00 €"
}

function formaterDate(date) {                                    // "2026-11-16T08:01:47Z" -> "16 novembre 2026"
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); // date SQL -> « 18 novembre 2026 »
}

function ecrire(id, texte) {                                     // écrit un texte dans l'élément qui a cet id
  document.getElementById(id).textContent = texte;               // textContent = protection XSS
}

// ===== 3. LA GALERIE DE PHOTOS =====
function afficherPhotos(photos, titre) {                          // photos = la liste reçue du serveur
  const principale = document.getElementById("photo-principale"); // la grande photo
  const miniatures = document.getElementById("miniatures");       // les petites photos en dessous

  if (photos.length === 0) {                                      // aucune photo
    principale.textContent = "Pas de photo";                      // on écrit un texte à la place
    return;                                                       // et on s'arrête
  }

  const grande = document.createElement("img");                   // crée la grande image
  grande.src = "/uploads/" + photos[0].chemin_photo;              // au départ : la première photo
  grande.alt = titre;                                             // texte si l'image ne s'affiche pas (accessibilité)
  principale.appendChild(grande);                                 // place la grande image dans la page

  if (photos.length === 1) return;                                // une seule photo : pas besoin de miniatures

  photos.forEach((photo, index) => {                              // une miniature par photo
    const mini = document.createElement("img");                   // crée une petite image
    mini.src = "/uploads/" + photo.chemin_photo;                  // même photo, en miniature
    mini.alt = titre + " — photo " + (index + 1);                 // « Air Max — photo 2 »
    if (index === 0) mini.classList.add("active");                // la 1re est sélectionnée
    mini.addEventListener("click", () => {                        // clic sur une miniature :
      grande.src = mini.src;                                      // elle devient la grande photo
      miniatures.querySelectorAll("img").forEach((img) => img.classList.remove("active")); // enlève la sélection de toutes les miniatures
      mini.classList.add("active");                               // et on la marque comme sélectionnée
    });
    miniatures.appendChild(mini);                                 // ajoute la miniature sous la grande photo
  });
}

// ===== 4. LA ZONE D'ACHAT (dépend de qui regarde) =====
function afficherZoneAchat(annonce) {                             // choisit ce qu'on affiche sous les infos
  const zone = document.getElementById("zone-achat");             // la zone vide prévue dans le HTML
  const utilisateur = getUtilisateur();                           // vient de auth.js (null si pas connecté)

  if (annonce.statut_annonce === "vendue") {                      // déjà vendue
    zone.innerHTML = '<p class="info-achat">Cette paire a déjà été vendue.</p>'; // annonce vendue : simple message
  } else if (!utilisateur) {                                      // visiteur non connecté
    zone.innerHTML = '<a href="connexion.html" class="bouton-principal">Se connecter pour acheter</a>'; // visiteur : lien vers la connexion
  } else if (utilisateur.id === annonce.id_vendeur_annonce) {     // c'est le vendeur lui-même
    zone.innerHTML = '<p class="info-achat">C\'est votre annonce.</p>'; // vendeur : il ne peut pas acheter
  } else {                                                        // membre connecté : il peut acheter
    afficherBoutonAcheter(annonce);                               // membre : affiche le bouton « Acheter » (partie 5)
  }
}

// ===== 5. ACHETER EN 2 CLICS : « Acheter » puis « Confirmer » =====
function afficherBoutonAcheter(annonce) {                         // 1re étape de l'achat
  const zone = document.getElementById("zone-achat");             // la zone d'achat
  zone.innerHTML = '<button class="bouton" id="bouton-acheter">Acheter</button>'; // affiche le bouton « Acheter »
  document.getElementById("bouton-acheter").addEventListener("click", () => demanderConfirmation(annonce)); // clic -> demande de confirmation
}

function demanderConfirmation(annonce) {                          // 2e étape : éviter un achat par erreur
  const zone = document.getElementById("zone-achat");             // la zone d'achat, remplacée par la question + 2 boutons
  zone.innerHTML = `
    <p class="question-achat" id="question-achat"></p>
    <div class="boutons-achat">
      <button class="bouton" id="bouton-confirmer">Confirmer l'achat</button>
      <button class="bouton-lien" id="bouton-annuler">Annuler</button>
    </div>
    <p class="message" id="message"></p>
  `;
  document.getElementById("question-achat").textContent =        // textContent = protection XSS
    "Acheter « " + annonce.titre_annonce + " » pour " + formaterPrix(annonce.prix_annonce) + " ?"; // « Acheter « Air Max » pour 85,00 € ? »
  document.getElementById("bouton-annuler").addEventListener("click", () => afficherBoutonAcheter(annonce)); // Annuler -> on revient au bouton « Acheter »
  document.getElementById("bouton-confirmer").addEventListener("click", () => acheter(annonce)); // Confirmer -> on envoie l'achat
}

async function acheter(annonce) {                                 // 3e étape : envoyer l'achat au serveur
  const bouton = document.getElementById("bouton-confirmer");     // le bouton « Confirmer l'achat »
  bouton.disabled = true;                                         // pas de double achat

  try {                                                           // essaie d'envoyer l'achat…
    const reponse = await fetch("/api/annonces/" + annonce.id_annonce + "/acheter", { // adresse : /api/annonces/3/acheter
      method: "POST",                                             // POST = on demande une action
      headers: { Authorization: "Bearer " + getJeton() },         // le jeton dit au serveur QUI achète
    });
    const resultat = await reponse.json();                        // lit la réponse du serveur

    if (reponse.status === 201) {                                 // achat confirmé
      document.getElementById("zone-achat").innerHTML =           // remplace la zone par le message de réussite
        '<p class="info-achat succes-achat">Achat confirmé ! Cette paire est à vous.</p>'; // message vert
    } else if (reponse.status === 401) {                          // jeton absent ou expiré
      afficherMessage(resultat.message + " Redirection…", "erreur"); // message en rouge
      setTimeout(deconnexion, 1500);                              // après 1,5 s : déconnexion (auth.js)
    } else {                                                      // 403 ou 409 : refusé par le serveur
      afficherMessage(resultat.message, "erreur");                // « Vous ne pouvez pas acheter… » ou « déjà vendue »
    }
  } catch (erreur) {                                              // …si le serveur ne répond pas
    afficherMessage("Impossible de joindre le serveur.", "erreur"); // message clair
    bouton.disabled = false;                                      // on peut réessayer
  }
}

// ===== 6. CHARGER ET AFFICHER L'ANNONCE =====
async function chargerAnnonce() {                                 // appelée au chargement de la page
  if (!idAnnonce) {                                               // pas de ?id= dans l'adresse
    messagePage.textContent = "Aucune annonce choisie.";          // message à la place du détail
    return;                                                       // on s'arrête
  }

  try {                                                           // essaie de joindre le serveur…
    const reponse = await fetch("/api/annonces/" + encodeURIComponent(idAnnonce)); // demande au serveur
    if (reponse.status === 404) {                                 // l'annonce n'existe pas
      messagePage.textContent = "Cette annonce n'existe pas ou a été supprimée."; // message clair
      return;                                                     // on s'arrête
    }
    if (!reponse.ok) throw new Error("Erreur " + reponse.status); // autre erreur (500…) -> va dans catch
    const annonce = await reponse.json();                         // lit l'annonce envoyée en JSON

    // Remplir les textes
    document.title = annonce.titre_annonce + " — ShoeRoom";       // titre de l'onglet du navigateur
    ecrire("detail-marque", annonce.marque_annonce);              // remplit chaque zone de la page…
    ecrire("detail-titre", annonce.titre_annonce);                // le titre
    ecrire("detail-prix", formaterPrix(annonce.prix_annonce));    // le prix formaté
    ecrire("detail-size", Number(annonce.size_annonce).toLocaleString("fr-FR")); // la pointure (42,5)
    ecrire("detail-etat", annonce.etat_annonce === "neuves" ? "Neuves" : "Occasion"); // l'état en toutes lettres
    ecrire("detail-vendeur", annonce.vendeur_prenom);             // le prénom du vendeur
    ecrire("detail-date", formaterDate(annonce.date_publication_annonce)); // la date en français
    ecrire("detail-description", annonce.description_annonce || "Pas de description."); // texte par défaut si vide

    afficherPhotos(annonce.photos, annonce.titre_annonce);        // la galerie
    afficherZoneAchat(annonce);                                   // le bouton ou le message d'achat

    messagePage.hidden = true;                                    // cache « Chargement… »
    detail.hidden = false;                                        // affiche le détail
  } catch (erreur) {                                              // …si le serveur ne répond pas
    messagePage.textContent = "Impossible de charger l'annonce."; // message clair
  }
}

// ===== 7. AU CHARGEMENT DE LA PAGE =====
chargerAnnonce();                                                 // lance tout au chargement de la page