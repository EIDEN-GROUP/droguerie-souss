# Catalogues

Le contenu affiché sur `/catalogue` est déclaré dans **`src/lib/catalogue.ts`** (une entrée par
édition). Deux formats sont possibles.

## Format `pdf`

Le fichier est déposé dans **`public/catalogue/`** et servi tel quel ; la carte l'ouvre dans un
nouvel onglet, où c'est la visionneuse du navigateur qui l'affiche. `/catalogue/<slug>` redirige
vers le fichier, les deux adresses mènent donc au même endroit.

L'URL, le poids et le nombre de pages sont renseignés dans `catalogueEditions`
(`src/lib/catalogue.ts`) — `scripts/catalogue-covers.mjs` affiche les trois valeurs.

## Format `flipbook`

Déposez les pages dans un dossier portant le slug de l'édition :

```
src/assets/catalogue/2027/page-01.jpg
src/assets/catalogue/2027/page-02.jpg
…
```

- La numérotation **sur deux chiffres est obligatoire** : les pages sont triées par nom de
  fichier (`page-2.jpg` passerait après `page-10.jpg`).
- Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`
- Portrait A4 (ratio ~1:1,414), **le même ratio pour toutes les pages**, largeur ~1400 px.
- `page-01` est la couverture et la dernière page la quatrième de couverture : elles sont
  affichées seules, en page « dure ». Prévoyez donc un nombre **pair** de pages.

Aucune autre étape : les fichiers sont détectés automatiquement et les pages provisoires
disparaissent dès qu'une image est présente.

## Couvertures des cartes

Les couvertures vivent dans `covers/<slug>.webp` et sont fabriquées par le script :

```bash
npm install --no-save --no-package-lock pdf-to-img @napi-rs/canvas
node scripts/catalogue-covers.mjs
```

Ajoutez l'édition au tableau en tête du script avant de le lancer, avec l'une des deux sources :

- `image` : le visuel de couverture fourni (le cas des deux éditions actuelles, qui ont leur
  affiche en portrait) ;
- `pdf` : à défaut, la première page du fichier est rendue en image.

Les deux paquets ne servent qu'à cette génération : ils sont volontairement hors
`package.json`, d'où `--no-save --no-package-lock`.

Le cadre de la carte est en **3/4**, le format des affiches de couverture, donc aucun rognage.
Sans image, la carte retombe sur une couverture dessinée aux couleurs de la marque (logo,
millésime, filet rouge).
