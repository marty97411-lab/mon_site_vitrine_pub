# Orientation et personnalité

Site web en français d'aide à la réflexion sur l'orientation professionnelle. Le visiteur passe
un questionnaire de personnalité (modèle Big Five, items du domaine public de l'IPIP), obtient
un profil sous forme de scores continus, puis des pistes de familles de métiers (modèle RIASEC,
données O*NET) avec des explications sourcées.

> **Statut : prototype.** Le questionnaire ne compte que 10 items d'exemple, les traductions ne
> sont pas validées, aucune norme n'est encore intégrée et la correspondance profil → métiers
> reste à définir. Voir `docs/sources.md`.

Un test de personnalité est une aide à la réflexion, pas un verdict. **Aucune réponse n'est
envoyée à un serveur** : les calculs se font dans le navigateur, sans compte ni cookie ni outil
de mesure d'audience.

## Installation

Prérequis : Node.js ≥ 22.23.4 (voir `.nvmrc`) et npm.

```bash
npm install
```

## Lancement

```bash
npm run dev       # http://localhost:4321
```

## Autres commandes

| Commande          | Rôle                                               |
| ----------------- | -------------------------------------------------- |
| `npm run build`   | Vérifie les types puis génère le site dans `dist/` |
| `npm run preview` | Prévisualise le build                              |
| `npm test`        | Lance les tests unitaires (Vitest)                 |
| `npm run lint`    | Analyse le code (ESLint)                           |
| `npm run format`  | Formate le code (Prettier)                         |

## Documentation

- `CLAUDE.md` : principes scientifiques, conventions et organisation du projet.
- `docs/sources.md` : sources, licences et statut de vérification.
- `docs/methodologie-score.md` : règles de calcul des scores.
- `docs/decisions/` : décisions de conception.

## Licences

- Code : [MIT](LICENSE).
- Contenu : [CC BY 4.0](LICENSE-CONTENU.md).
- Items : International Personality Item Pool, domaine public.
- Données métiers : base O*NET 31.0 (USDOL/ETA), CC BY 4.0. O*NET® est une marque déposée de
  l'USDOL/ETA.
