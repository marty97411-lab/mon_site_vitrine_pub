# Personnalisé

**Personnalisé** est un site web en français d'aide à la réflexion sur l'orientation
professionnelle et sur la vie que l'on veut mener. Le visiteur choisit
un parcours rapide (80 questions) ou complet (180 questions) et répond à deux questionnaires :

- **personnalité** (Big Five, items du domaine public de l'IPIP) : profil en scores continus ;
- **intérêts professionnels** (RIASEC, O*NET Interest Profiler) : rapprochement avec des familles
  de métiers de la base O*NET, selon la méthode de corrélation documentée par O*NET.

Le site propose aussi des contenus à lire sans faire le test : « Ma situation » (repères
scientifiques), « Comprendre », « Philosophie » (réflexion) et « Besoin d'en parler ? ».

> **Statut : prototype.** Les traductions des items ne sont pas validées, les métiers sont
> américains (intitulés en anglais) et plusieurs références restent à vérifier. La traduction des
> questionnaires O*NET n'a pas fait l'objet de l'étude de validation que leur licence exige avant
> diffusion. Voir `docs/sources.md` et `docs/decisions/0004-deux-questionnaires-deux-parcours.md`.

Un test de personnalité est une aide à la réflexion, pas un verdict. **Aucune réponse n'est
envoyée à un serveur** : les calculs se font dans le navigateur, les réponses y sont enregistrées
localement pour pouvoir reprendre, sans compte ni cookie ni outil de mesure d'audience.

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

| Commande              | Rôle                                                  |
| --------------------- | ----------------------------------------------------- |
| `npm run build`       | Vérifie les types puis génère le site dans `dist/`    |
| `npm run preview`     | Prévisualise le build                                 |
| `npm test`            | Lance les tests unitaires (Vitest)                    |
| `npm run lint`        | Analyse le code (ESLint)                              |
| `npm run format`      | Formate le code (Prettier)                            |
| `npm run import:onet` | Régénère les profils de métiers O*NET (réseau requis) |
| `npm run doc:sources` | Régénère `docs/sources.md` depuis `sources.json`      |

## Documentation

- `CLAUDE.md` : principes scientifiques, conventions et organisation du projet.
- `docs/sources.md` : sources, licences et statut de vérification.
- `docs/methodologie-score.md` : règles de calcul des scores.
- `docs/decisions/` : décisions de conception (dont 0007 : identité visuelle et contenus).

## Licences

- Code : [MIT](LICENSE).
- Contenu : [CC BY 4.0](LICENSE-CONTENU.md).
- Items : International Personality Item Pool, domaine public.
- Données métiers : base O*NET 31.0 (USDOL/ETA), CC BY 4.0.
- Questionnaires d'intérêts : O*NET Interest Profiler (USDOL/ETA), traduits sous O*NET Tools
  Developer License. O*NET® est une marque déposée de l'USDOL/ETA.

## Mention O*NET (obligatoire)

This product includes information from the O*NET Career Exploration Tools by the U.S. Department
of Labor, Employment and Training Administration (USDOL/ETA). Used under the
[O\*NET Tools Developer License](https://www.onetcenter.org/license_toolsdev.html). O*NET® is a
trademark of USDOL/ETA. The contributors of this project have modified all or some of this
information. USDOL/ETA has not approved, endorsed, or tested these modifications.

Modifications et avertissements (_modifications and disclaimers_) : page `/modifications-onet` du
site (`src/pages/modifications-onet.astro`).
