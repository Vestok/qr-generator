# Générateur de QR Code

[Essayer en ligne](https://vestok.github.io/qr-generator/)

Application web en HTML, CSS et JavaScript natif, sans framework ni
dépendance de build. Elle génère deux types de QR codes, avec téléchargement
au format PNG. En mode Site web, le scan ouvre l'adresse saisie. En mode
Wi-Fi, il propose la connexion au réseau, sans avoir à communiquer le mot de
passe oralement.

## Utilisation

Ouvrir `index.html` dans un navigateur. Aucune installation n'est
nécessaire : l'application fonctionne entièrement en local, y compris hors
ligne.

1. Sélectionner l'onglet Site web ou Wi-Fi
2. Renseigner les champs (adresse, ou nom du réseau, mot de passe et type de
   sécurité)
3. Choisir la taille du QR code (200, 300 ou 500 px)
4. Cliquer sur Générer le QR code
5. Éventuellement, Télécharger en PNG pour récupérer l'image

## Confidentialité

Aucune donnée ne quitte le navigateur. Le QR code est calculé localement et
la bibliothèque `qrcode.js` est servie depuis le dépôt, sans CDN : le projet
n'émet aucune requête réseau. Les identifiants Wi-Fi saisis ne sont donc
transmis à personne, ce qui était la condition pour proposer ce mode.

## Serveur local (facultatif)

Le projet n'en a pas besoin, mais servir les fichiers plutôt que les ouvrir
directement reste une bonne pratique : certaines fonctionnalités du
navigateur (modules ES, `fetch` de fichiers locaux) sont indisponibles sur
le protocole `file://`. Depuis le dossier du projet :

```bash
# Avec Python
python -m http.server 8765

# Ou avec Node.js
npx serve -p 8765
```

L'application est alors accessible sur <http://localhost:8765>.
Arrêt du serveur : `Ctrl+C`.

## Structure du projet

| Fichier         | Rôle                                                        |
| --------------- | ----------------------------------------------------------- |
| `index.html`    | Structure de la page : formulaire et zone de résultat        |
| `style.css`     | Mise en forme : carte centrée, thème géré par variables CSS  |
| `script.js`     | Logique : écoute du formulaire, génération, téléchargement   |
| `qrcode.min.js` | Bibliothèque [qrcode.js](https://github.com/davidshimjs/qrcodejs) de davidshimjs, incluse localement |

## Fonctionnement

Le JavaScript intercepte la soumission du formulaire (`preventDefault`) pour
éviter le rechargement de la page. La bibliothèque `qrcode.js` calcule le QR
code et le dessine dans un `<canvas>` qu'elle insère dans le conteneur
`#conteneur-qr`. Le téléchargement convertit ce canvas en PNG via
`canvas.toDataURL()`, puis déclenche un lien `<a download>` créé à la volée.

Le niveau de correction d'erreur retenu est M : le code reste lisible même
si environ 15 % de sa surface est masquée ou abîmée.

Un QR code encode toujours du texte. Le mode Wi-Fi produit une chaîne au
format normalisé `WIFI:T:WPA;S:nom;P:motdepasse;;`, que les téléphones
savent interpréter. Un antislash échappe les caractères spéciaux (`;`, `:`,
`,`, `"`, `\`) pour ne pas rompre ce format.
