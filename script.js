// Générateur de QR Code (site web ou Wi-Fi).
// qrcode.js fait le travail, on branche l'interface dessus.
// Un QR code encode toujours du TEXTE : l'URL telle quelle, ou la chaîne
// standardisée WIFI:T:WPA;S:nom;P:motdepasse;; que les téléphones lisent.

// 1. Éléments du DOM
const formulaire = document.getElementById("formulaire");
const champsUrl = document.getElementById("champs-url");
const champsWifi = document.getElementById("champs-wifi");
const champUrl = document.getElementById("champ-url");
const champSsid = document.getElementById("champ-ssid");
const champMotdepasse = document.getElementById("champ-motdepasse");
const champSecurite = document.getElementById("champ-securite");
const champTaille = document.getElementById("champ-taille");
const zoneResultat = document.getElementById("resultat");
const conteneurQr = document.getElementById("conteneur-qr");
const urlAffichee = document.getElementById("url-affichee");
const boutonTelecharger = document.getElementById("bouton-telecharger");
const messageErreur = document.getElementById("message-erreur");

// 2. Bascule entre les modes "Site web" et "Wi-Fi"

// querySelectorAll : tous les éléments correspondant au sélecteur CSS
const boutonsMode = document.querySelectorAll('input[name="mode"]');

function modeActuel() {
  // Le radio coché porte la valeur du mode choisi ("url" ou "wifi")
  return document.querySelector('input[name="mode"]:checked').value;
}

function changerDeMode() {
  const enModeWifi = modeActuel() === "wifi";

  // toggle(classe, condition) : ajoute si vrai, retire sinon
  champsUrl.classList.toggle("cache", enModeWifi);
  champsWifi.classList.toggle("cache", !enModeWifi);

  // Attention : un champ "required" invisible bloque l'envoi du formulaire.
  // On ne rend obligatoires que les champs visibles.
  champUrl.required = !enModeWifi;
  champSsid.required = enModeWifi;

  // On repart d'un résultat vierge quand on change de mode
  zoneResultat.classList.add("cache");
  messageErreur.classList.add("cache");
}

// On écoute le changement sur chaque radio
boutonsMode.forEach((bouton) => bouton.addEventListener("change", changerDeMode));

// Réseau ouvert : le mot de passe n'a pas de sens, on désactive le champ
champSecurite.addEventListener("change", () => {
  const reseauOuvert = champSecurite.value === "nopass";
  champMotdepasse.disabled = reseauOuvert;
  if (reseauOuvert) champMotdepasse.value = "";
});

// 3. Construction du texte à encoder

// Dans le format WIFI:, le ; sépare les champs. S'il apparaît dans un mot
// de passe, il faut l'échapper avec un \ pour qu'il reste un caractère.
function echapperPourWifi(texte) {
  // [\\;,:"] liste les caractères à protéger, "\\$1" les préfixe d'un antislash
  return texte.replace(/([\\;,:"])/g, "\\$1");
}

function construireTexteQr() {
  if (modeActuel() === "url") {
    // .trim() enlève les espaces accidentels en début/fin de saisie
    return champUrl.value.trim();
  }

  // Mode Wi-Fi : on assemble la chaîne standardisée morceau par morceau
  const ssid = echapperPourWifi(champSsid.value.trim());
  const securite = champSecurite.value;

  if (securite === "nopass") {
    // Réseau ouvert : pas de mot de passe dans la chaîne
    return `WIFI:T:nopass;S:${ssid};;`;
  }

  const motdepasse = echapperPourWifi(champMotdepasse.value);
  return `WIFI:T:${securite};S:${ssid};P:${motdepasse};;`;
}

// 4. Génération à la soumission du formulaire
formulaire.addEventListener("submit", (evenement) => {
  // Sans preventDefault, soumettre rechargerait la page
  evenement.preventDefault();

  const texte = construireTexteQr();
  // La valeur d'un <select> est toujours une chaîne : Number() la convertit
  const taille = Number(champTaille.value);

  // La librairie ne sait pas se mettre à jour : on efface et on recrée
  conteneurQr.innerHTML = "";
  messageErreur.classList.add("cache");

  // try/catch : la librairie lève une exception si le texte est trop long
  try {
    // new QRCode(conteneur, options) insère l'image dans le conteneur
    new QRCode(conteneurQr, {
      text: texte,
      width: taille,
      height: taille,
      colorDark: "#000000",
      colorLight: "#ffffff",
      // Correction d'erreur M : lisible même si ~15 % de la surface est abîmée
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch (erreur) {
    messageErreur.textContent = "Impossible de générer le QR code : " + erreur.message;
    messageErreur.classList.remove("cache");
    zoneResultat.classList.add("cache");
    return;
  }

  // Rappel de ce que contient le QR code, sans le mot de passe
  urlAffichee.textContent =
    modeActuel() === "url"
      ? champUrl.value.trim()
      : "Réseau Wi-Fi : " + champSsid.value.trim();
  zoneResultat.classList.remove("cache");
});

// 5. Téléchargement en PNG
boutonTelecharger.addEventListener("click", () => {
  // La librairie a dessiné dans un <canvas> : on le récupère
  const canvas = conteneurQr.querySelector("canvas");
  if (!canvas) return; // rien à télécharger si aucun QR code généré

  // toDataURL : le canvas devient une data URL, le PNG encodé en base64
  const imagePng = canvas.toDataURL("image/png");

  // Astuce classique : un lien <a> invisible avec l'attribut "download",
  // puis un clic simulé dessus.
  const lien = document.createElement("a");
  lien.href = imagePng;
  lien.download = modeActuel() === "url" ? "qr-site.png" : "qr-wifi.png";
  lien.click();
});
