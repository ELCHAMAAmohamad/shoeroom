// js/auth.js — Inscription, connexion et menu de ShoeRoom (côté navigateur)

// ===== 1. SE SOUVENIR DE L'UTILISATEUR CONNECTÉ =====

function getUtilisateur() {                                      // renvoie l'utilisateur connecté (ou null)
  const texte = localStorage.getItem("utilisateur");             // lit le texte gardé dans le navigateur
  return texte ? JSON.parse(texte) : null;                       // texte -> objet, ou null si vide
}

function setUtilisateur(utilisateur) {                           // garde l'utilisateur après la connexion
  localStorage.setItem("utilisateur", JSON.stringify(utilisateur)); // objet -> texte, rangé dans le navigateur
}

function deconnexion() {                                         // déconnecte l'utilisateur
  localStorage.removeItem("utilisateur");                        // efface l'utilisateur de la mémoire
  window.location.replace("index.html");                         // va à l'accueil sans garder la page dans l'historique
}

// ===== 2. AFFICHER UN MESSAGE SOUS LE FORMULAIRE =====

function afficherMessage(texte, type) {                          // affiche un message vert ou rouge
  const zone = document.getElementById("message");               // trouve le <p id="message"> de la page
  zone.textContent = texte;                                      // écrit le texte (comme du texte, jamais du code)
  zone.className = "message " + type;                            // ajoute la classe CSS "succes" (vert) ou "erreur" (rouge)
}

// ===== 3. ENVOYER DES DONNÉES AU SERVEUR =====

async function envoyer(adresse, donnees) {                       // envoie des données et attend la réponse
  const reponse = await fetch(adresse, {                         // fetch = envoie une requête HTTP au serveur
    method: "POST",                                              // POST = on envoie des données
    headers: { "Content-Type": "application/json" },             // prévient le serveur que c'est du JSON
    body: JSON.stringify(donnees),                               // les données, transformées en texte JSON
  });
  const resultat = await reponse.json();                         // lit la réponse JSON du serveur
  return { ok: reponse.ok, resultat };                           // ok = true si réussite (200, 201), false si erreur
}

// ===== 4. FORMULAIRE D'INSCRIPTION (inscription.html) =====

const formInscription = document.getElementById("form-inscription"); // cherche le formulaire (null sur les autres pages)

if (formInscription) {                                           // seulement si on est sur la page d'inscription
  formInscription.addEventListener("submit", async (evenement) => { // quand on clique sur « Créer mon compte »
    evenement.preventDefault();                                  // empêche la page de se recharger
    const bouton = formInscription.querySelector("button");      // trouve le bouton du formulaire
    bouton.disabled = true;                                      // désactive le bouton (pas de double clic)

    try {                                                        // essaie d'envoyer…
      const { ok, resultat } = await envoyer("/api/inscription", { // envoie au serveur et attend la réponse
        prenom: document.getElementById("prenom").value.trim(),  // lit le prénom (trim = enlève les espaces autour)
        nom: document.getElementById("nom").value.trim(),        // lit le nom
        email: document.getElementById("email").value.trim(),    // lit l'email
        motDePasse: document.getElementById("motDePasse").value, // lit le mot de passe (sans trim)
      });

      if (ok) {                                                  // si le compte est créé (201)
        afficherMessage("Compte créé ! Redirection vers la connexion…", "succes"); // message vert
        setTimeout(() => window.location.replace("connexion.html"), 1500); // après 1,5 s, va à la connexion
      } else {                                                   // sinon (400, 409…)
        afficherMessage(resultat.message, "erreur");             // affiche en rouge le message du serveur
        bouton.disabled = false;                                 // réactive le bouton pour corriger
      }
    } catch (erreur) {                                           // …si le serveur ne répond pas
      afficherMessage("Impossible de joindre le serveur.", "erreur"); // message d'erreur clair
      bouton.disabled = false;                                   // réactive le bouton
    }
  });
}

// ===== 5. FORMULAIRE DE CONNEXION (connexion.html) =====

const formConnexion = document.getElementById("form-connexion"); // cherche le formulaire (null sur les autres pages)

if (formConnexion) {                                             // seulement si on est sur la page de connexion
  formConnexion.addEventListener("submit", async (evenement) => { // quand on clique sur « Se connecter »
    evenement.preventDefault();                                  // empêche la page de se recharger
    const bouton = formConnexion.querySelector("button");        // trouve le bouton
    bouton.disabled = true;                                      // désactive le bouton (pas de double clic)

    try {                                                        // essaie d'envoyer…
      const { ok, resultat } = await envoyer("/api/connexion", { // envoie au serveur et attend la réponse
        email: document.getElementById("email").value.trim(),    // lit l'email
        motDePasse: document.getElementById("motDePasse").value, // lit le mot de passe
      });

      if (ok) {                                                  // si la connexion réussit (200)
        setUtilisateur(resultat.utilisateur);                    // garde l'utilisateur dans le navigateur
        afficherMessage("Connexion réussie !", "succes");        // message vert
        setTimeout(() => window.location.replace("index.html"), 800); // après 0,8 s, va à l'accueil
      } else {                                                   // sinon (401)
        afficherMessage(resultat.message, "erreur");             // « Email ou mot de passe incorrect. » en rouge
        bouton.disabled = false;                                 // réactive le bouton
      }
    } catch (erreur) {                                           // …si le serveur ne répond pas
      afficherMessage("Impossible de joindre le serveur.", "erreur"); // message d'erreur clair
      bouton.disabled = false;                                   // réactive le bouton
    }
  });
}

// ===== 6. DÉJÀ CONNECTÉ ? PAS BESOIN DE CONNEXION / INSCRIPTION =====

function redirigerSiDejaConnecte() {                             // renvoie à l'accueil si déjà connecté
  if (getUtilisateur() && (formConnexion || formInscription)) {  // connecté ET sur une page de formulaire ?
    window.location.replace("index.html");                       // alors on va à l'accueil
  }
}

redirigerSiDejaConnecte();                                       // vérifie au chargement de la page
window.addEventListener("pageshow", redirigerSiDejaConnecte);    // vérifie aussi après la flèche « retour » (cache)

// ===== 7. ADAPTER LE MENU SI QUELQU'UN EST CONNECTÉ =====

const utilisateur = getUtilisateur();                            // l'utilisateur connecté (ou null)
const menu = document.getElementById("menu");                    // le menu de l'en-tête

if (utilisateur && menu) {                                       // si quelqu'un est connecté
  menu.innerHTML = `
    <a href="index.html">Accueil</a>
    <span class="bonjour" id="bonjour"></span>
    <a href="#" id="lien-deconnexion">Déconnexion</a>
  `;                                                             // remplace le menu : Accueil | Bonjour | Déconnexion
  document.getElementById("bonjour").textContent = `Bonjour ${utilisateur.prenom}`; // écrit « Bonjour Sara » (textContent = protection XSS)
  document.getElementById("lien-deconnexion").addEventListener("click", (e) => { // quand on clique sur « Déconnexion »
    e.preventDefault();                                          // empêche le lien "#" de remonter la page
    deconnexion();                                               // déconnecte (partie 1)
  });
}

const titreAccueil = document.getElementById("titre-accueil");   // le grand titre (seulement sur index.html)
if (utilisateur && titreAccueil) {                               // si connecté et sur l'accueil
  titreAccueil.textContent = `Bonjour ${utilisateur.prenom}`;    // remplace « Bienvenue » par « Bonjour Sara »
}