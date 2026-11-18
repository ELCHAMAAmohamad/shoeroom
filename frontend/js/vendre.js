// js/vendre.js — page vendre.html : publier une annonce avec ses photos

// ===== 1. PAGE RÉSERVÉE AUX MEMBRES CONNECTÉS =====
if (!getUtilisateur()) {                                          // getUtilisateur vient de auth.js
  window.location.replace("connexion.html");                     // pas connecté : on va à la connexion
}

const formVendre = document.getElementById("form-vendre");       // le formulaire
const champPhotos = document.getElementById("photos");           // le champ "Choisir des photos"
const apercu = document.getElementById("apercu-photos");         // la zone des miniatures

const MAX_PHOTOS = 10;                                           // même limite que le serveur
const MAX_TAILLE = 2 * 1024 * 1024;                              // 2 Mo, comme le serveur
const TYPES_OK = ["image/jpeg", "image/png"];                    // JPG et PNG seulement

// ===== 2. VÉRIFIER LES PHOTOS CHOISIES (avant l'envoi) =====
function verifierPhotos(fichiers) {                              // renvoie un message d'erreur, ou "" si tout va bien
  if (fichiers.length === 0) return "Ajoutez au moins une photo.";
  if (fichiers.length > MAX_PHOTOS) return "10 photos maximum.";
  for (const f of fichiers) {                                    // on regarde chaque photo
    if (!TYPES_OK.includes(f.type)) return "« " + f.name + " » n'est pas une photo JPG ou PNG.";
    if (f.size > MAX_TAILLE) return "« " + f.name + " » dépasse 2 Mo.";
  }
  return "";                                                     // aucune erreur
}

// ===== 3. APERÇU DES PHOTOS (dès qu'on les choisit) =====
champPhotos.addEventListener("change", () => {                   // quand l'utilisateur choisit ses photos
  apercu.innerHTML = "";                                         // vide l'ancien aperçu
  const fichiers = Array.from(champPhotos.files);                // la liste des fichiers choisis

  fichiers.slice(0, MAX_PHOTOS).forEach((fichier, index) => {    // une miniature par photo
    const img = document.createElement("img");
    img.src = URL.createObjectURL(fichier);                      // adresse temporaire pour afficher la photo
    img.alt = "Photo " + (index + 1);
    if (index === 0) img.classList.add("principale");            // la 1re photo sera la photo de la carte
    apercu.appendChild(img);
  });

  const erreur = verifierPhotos(fichiers);                       // prévient tout de suite si une photo pose problème
  afficherMessage(erreur, erreur ? "erreur" : "");               // afficherMessage vient de auth.js
});

// ===== 4. ENVOYER L'ANNONCE =====
formVendre.addEventListener("submit", async (evenement) => {     // clic sur « Publier l'annonce »
  evenement.preventDefault();                                    // pas de rechargement de la page

  // a. Vérifier dans le navigateur (retour immédiat ; le serveur revérifie de toute façon)
  const titre = document.getElementById("titre").value.trim();
  const marque = document.getElementById("marque").value.trim();
  const size = document.getElementById("size").value;
  const prix = document.getElementById("prix").value;
  const etat = document.getElementById("etat").value;
  if (!titre || !marque || !size || !prix || !etat) {
    afficherMessage("Titre, marque, pointure, prix et état sont obligatoires.", "erreur");
    return;
  }
  const erreurPhotos = verifierPhotos(Array.from(champPhotos.files));
  if (erreurPhotos) {
    afficherMessage(erreurPhotos, "erreur");
    return;
  }

  // b. Préparer l'envoi : FormData prend tous les champs qui ont un "name", photos comprises
  const donnees = new FormData(formVendre);
  const bouton = formVendre.querySelector("button");
  bouton.disabled = true;                                        // pas de double envoi
  afficherMessage("Publication en cours…", "");

  try {
    const reponse = await fetch("/api/annonces", {
      method: "POST",
      headers: { Authorization: "Bearer " + getJeton() },        // le jeton dit au serveur QUI vend
      body: donnees,                                             // pas de Content-Type : le navigateur le met lui-même
    });
    const resultat = await reponse.json();

    if (reponse.status === 201) {                                // annonce créée
      afficherMessage("Annonce publiée ! Ouverture de votre annonce…", "succes");
      setTimeout(() => window.location.replace("annonce_detail.html?id=" + resultat.id), 800);
    } else if (reponse.status === 401) {                         // jeton absent ou expiré
      afficherMessage(resultat.message + " Redirection…", "erreur");
      setTimeout(deconnexion, 1500);                             // on efface la session et on repart à zéro
    } else {                                                     // 400 : un champ ou une photo refusé
      afficherMessage(resultat.message, "erreur");
      bouton.disabled = false;
    }
  } catch (erreur) {
    afficherMessage("Impossible de joindre le serveur.", "erreur");
    bouton.disabled = false;
  }
});