# Catalogues

Le contenu affiché sur `/catalogue` est déclaré dans **`src/lib/catalogue.ts`** (une entrée par
édition). Deux formats sont possibles.

## Format `flipbook` — 2024, 2025

Déposez les pages dans le dossier de l'édition :

```
src/assets/catalogue/2024/page-01.jpg
src/assets/catalogue/2024/page-02.jpg
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

## Format `pdf` — 2026

Le fichier est déposé dans **`public/catalogue/`** et servi tel quel ; la carte l'ouvre dans un
nouvel onglet. Le chemin, le poids et le nombre de pages sont renseignés dans
`catalogueEditions` (`src/lib/catalogue.ts`).

## Couvertures des cartes

Optionnelles. Une image nommée d'après l'édition remplace la couverture dessinée :

```
src/assets/catalogue/covers/2026.jpg
```

Sans image, la carte affiche une couverture aux couleurs de la marque (logo, millésime,
filet rouge).
