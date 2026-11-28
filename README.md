# Personalis

**Personalis** (du latin _personalis_, « personnel ») est un site web en français d'aide à la réflexion sur l'orientation professionnelle et sur la vie que l'on veut mener. Il aide chacun à mieux se connaître (personnalité, intérêts professionnels) et propose des familles de métiers, des contenus de réflexion et des ressources, **sans jamais vendre du rêve** : tout ce qui est affirmé repose sur des recherches sérieuses et sourcées, expliquées simplement d'abord, puis en détail pour ceux qui veulent creuser.

> **Statut : prototype.** Les traductions des items ne sont pas validées, les métiers sont américains (intitulés en anglais) et plusieurs références restent à vérifier. La traduction des questionnaires O*NET n'a pas fait l'objet de l'étude de validation que leur licence exige avant diffusion. Voir `docs/sources.md` et `docs/decisions/0004-deux-questionnaires-deux-parcours.md`.

---

## Sommaire

1. [La vision du projet](#1-la-vision-du-projet)
2. [Ce que fait le site](#2-ce-que-fait-le-site)
3. [Principes non négociables](#3-principes-non-négociables)
4. [Règles éditoriales](#4-règles-éditoriales)
5. [Identité visuelle](#5-identité-visuelle)
6. [Architecture technique](#6-architecture-technique)
7. [Installation et commandes](#7-installation-et-commandes)
8. [Méthode de travail attendue (pour Claude Code)](#8-méthode-de-travail-attendue-pour-claude-code)
9. [Historique des décisions](#9-historique-des-décisions)
10. [Feuille de route et chantiers ouverts](#10-feuille-de-route-et-chantiers-ouverts)
11. [Documentation](#11-documentation)
12. [Licences et mention O*NET](#12-licences-et-mention-onet)

---

## 1. La vision du projet

Personalis s'adresse à toute personne qui se pose des questions sur son orientation, son travail ou sa vie : élèves et étudiants, jeunes actifs, personnes en reconversion, sans emploi, en reprise après un arrêt, ou en deuxième partie de carrière.

L'objectif est double :

- **Informer sérieusement** : un test fondé sur des modèles scientifiques reconnus, des résultats nuancés, des sources vérifiables.
- **Accompagner avec bienveillance** : un site agréable où les curieux trouvent autant d'informations qu'ils le souhaitent, et où les visiteurs se sentent compris dans leurs questionnements, sans promesse irréaliste.

Ce que Personalis **n'est pas** : un outil qui désigne « le métier idéal », un test de type MBTI, un site de développement personnel sans fondement, ni un service qui collecte des données.

---

## 2. Ce que fait le site

### 2.1 Le test (deux questionnaires, deux parcours)

Le visiteur choisit son parcours sur une page de choix (durée, nombre de questions, précision) :

| Parcours    | Personnalité (Big Five)                    | Intérêts (RIASEC)                       | Durée     |
| ----------- | ------------------------------------------ | --------------------------------------- | --------- |
| **Rapide**  | 50 items (IPIP Big-Five Factor Markers)    | 30 items (O*NET Mini Interest Profiler) | 10-15 min |
| **Complet** | 120 items (IPIP-NEO-120, avec 30 facettes) | 60 items (O*NET Interest Profiler)      | 25-30 min |

- **Big Five** (le modèle scientifique de référence qui décrit la personnalité selon cinq grands traits : ouverture, conscienciosité, extraversion, agréabilité, névrosisme). Il sert à **décrire** : points forts, points de vigilance, environnements adaptés. Il **ne sert pas à classer les métiers**, car la recherche montre que ses liens avec le type de métier sont modestes.
- **RIASEC** (un modèle qui classe les intérêts professionnels en six types : Réaliste, Investigateur, Artistique, Social, Entreprenant, Conventionnel). C'est lui qui sert au **rapprochement avec les métiers** de la base O*NET, selon la méthode de corrélation de profils documentée par O*NET.
- Un seul moteur de questionnaire et de cotation pour les deux parcours, configuré par des fichiers de données.
- Les résultats indiquent toujours le parcours passé et son niveau de précision ; depuis le parcours rapide, on propose le parcours complet.
- Les réponses sont enregistrées **uniquement dans le navigateur** (localStorage) pour pouvoir reprendre plus tard.

### 2.2 La page de résultats

- Scores continus (jamais de « types »), en barres pour le Big Five (facettes en dépliable) et en hexagone pour le RIASEC, toujours avec une phrase explicative et une alternative textuelle.
- Percentiles uniquement si des normes publiées et sourcées existent ; sinon, score sur 5.
- Plusieurs familles de métiers (jamais un « métier idéal »), avec un niveau de correspondance compréhensible et des explications sur la **correspondance** et la **préparation** (Job Zones O*NET avec équivalence indicative en France).
- Section « Pour aller plus loin, selon votre profil » : articles et livres proposés selon des règles simples et transparentes (`src/data/recommandations.json`), présentés comme des pistes de lecture et non comme un résultat scientifique.

### 2.3 Les contenus à lire (sans faire le test)

Menu principal : **Accueil, Le test, Ma situation, Explication, Philosophie, Livres conseillés, À propos.**

- **Ma situation** (badge « Science ») : articles par moment de vie (je ne sais pas ce que je veux faire, orientation, premier emploi, mon travail ne me plaît plus, donner du sens, conciliation, reconversion, sans emploi, reprise après un arrêt, se mettre à son compte, deuxième partie de carrière). Tous suivent le même modèle d'article (voir `CLAUDE.md` et `docs/decisions/`).
- **Explication** (anciennement « Comprendre ») : les traits, les intérêts, « la science derrière », le dossier **Introversion et extraversion**, et le **Glossaire**.
- **Philosophie** (badge « Réflexion ») : Aristote, les stoïciens, Montaigne, Sartre, Simone Weil, Hannah Arendt, l'ikigai (présenté honnêtement). L'encadré expliquant la différence entre science et réflexion figure **uniquement** sur la page principale de la section.
- **Livres conseillés** : 34 livres vérifiés, avec étiquette (Fondé sur la recherche / Philosophie / Témoignage-inspiration), bref résumé, « Pour qui » intégré à « L'essentiel », résumé détaillé en menu déroulant, et « Ce qu'il faut garder en tête » en plus petit.
- **Besoin d'en parler ?** : accompagnement professionnel en haut (CEP, CIO/Onisep, France Travail), et en bas, en plus petit mais lisible et sans clic, le **3114** (prévention du suicide, lien `tel:`).
- **À propos** : démarche, limites, origine du nom Personalis, crédits et licences.

---

## 3. Principes non négociables

1. **Rigueur scientifique.** Big Five et RIASEC uniquement. Pas de MBTI, d'ennéagramme ni de « types ». Chaque affirmation affichée est reliée à une source (DOI ou lien) dans `sources.json`.
2. **Ne jamais inventer.** Aucun chiffre, aucune référence, aucun livre, aucun résumé inventé. Si une donnée manque : `TODO` explicite ou marqueur `todo_source`, jamais une valeur plausible.
3. **Honnêteté.** Un test est une aide à la réflexion, pas un verdict. Toujours présenter les limites, les débats scientifiques et les livres « discutés » comme tels.
4. **Vie privée.** Aucune donnée envoyée à un serveur : pas de compte, pas de cookie, pas de traceur ni d'outil de mesure d'audience, polices auto-hébergées. Tout est calculé dans le navigateur.
5. **Simplicité.** Le site ne doit pas devenir plus compliqué à mesure qu'on ajoute des sujets : chaque nouveau contenu s'intègre dans la structure existante, sans nouvel onglet sauf nécessité, et la page d'accueil reste simple.
6. **Accessibilité.** Mobile d'abord, WCAG AA (contrastes vérifiés), texte jamais en dessous de 15 px, animations désactivées si `prefers-reduced-motion`.
7. **Licences respectées.** Items IPIP (domaine public), O*NET (mention obligatoire, voir section 12), citations courtes et référencées, résumés de livres rédigés avec ses propres mots.

---

## 4. Règles éditoriales

- **Vouvoiement partout**, sans exception (pages, questionnaires, boutons, messages d'erreur).
- **Ton** : chaleureux, rassurant, mais toujours honnête. Pas de promesses (« trouvez le métier de vos rêves »), pas de positivité forcée. Chaque trait a des atouts et des coûts : il n'existe pas de bon ou de mauvais profil.
- **Trois niveaux de lecture** partout :
  1. **L'essentiel** : une ou deux phrases, toujours visibles ;
  2. **Comprendre** : un paragraphe accessible ;
  3. **Approfondir** (dépliable) : études, chiffres, limites, références.
- **Jargon** : à la première apparition sur chaque page, explication courte entre parenthèses (Big Five, RIASEC, facette, percentile, O*NET, Job Zone…), terme cliquable vers le Glossaire. Définitions centralisées dans un seul fichier de données.
- **Science et réflexion séparées** : badge « Science » ou « Réflexion » sur chaque page.
- **Sources et mentions légales discrètes** : petit texte atténué ; les licences tiennent sur une ligne avec un lien vers « Crédits et licences ».
- **Messages clés à porter** (sourcés) : la personnalité et les intérêts évoluent ; une carrière n'est pas un choix unique (Savickas, Krumboltz) ; on peut donner du sens à son travail sans changer de métier (job crafting) ; autonomie, compétence et lien aux autres nourrissent la motivation (théorie de l'autodétermination).

---

## 5. Identité visuelle

- Ambiance **lumineuse et moderne** : fond clair, une couleur principale vive mais douce, beaucoup d'espace, cartes arrondies, ombres légères.
- Tous les choix (couleurs, typographies, espacements) sont des **variables CSS (design tokens) dans un seul fichier** : ne jamais coder une couleur en dur.
- Illustrations abstraites en SVG, pas de photos de banque d'images. Pas de rouge/vert qui suggère un « bon » ou « mauvais » score.
- Composants réutilisables : bouton, carte, encadré « L'essentiel », bloc dépliable « En savoir plus », encadré « Source », badges « Science »/« Réflexion », barre de progression, fil d'Ariane.

---

## 6. Architecture technique

- **Astro** (site statique) + **TypeScript strict**, ESLint, Prettier, **Vitest**.
- **Contenus** en Markdown/JSON via les _content collections_ d'Astro, validés par des **schémas Zod** (items, traits, métiers, sources, normes, livres, articles). Le build échoue si une fiche cite une source absente de `sources.json`, si une affirmation n'a ni source ni marqueur `todo_source`, si un métier n'a ni code O*NET ni code ROME, ou si une facette est rattachée au mauvais trait.

Organisation principale (vérifier l'arborescence réelle avec `ls` avant toute modification) :

| Emplacement                     | Contenu                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/pages/`                    | Pages du site (accueil, test, résultats, sections, à propos, mentions légales, crédits)         |
| `src/content/`                  | Collections : traits, métiers, livres, articles « Ma situation », pages philosophie, glossaire… |
| `src/data/questionnaires/`      | Items des questionnaires (trait/facette ou dimension RIASEC, sens de cotation, source, licence) |
| `src/data/recommandations.json` | Règles de recommandation d'articles et de livres selon le profil                                |
| `src/lib/scoring/`              | Logique de cotation et de rapprochement (avec tests)                                            |
| `docs/`                         | Sources, méthodologie, décisions de conception                                                  |

Règles de calcul (détails dans `docs/methodologie-score.md`) : inversion des items formulés en sens contraire, moyenne par facette et par trait ; score `null` si moins de la moitié des items d'une échelle ont une réponse ; percentile `null` sans norme sourcée.

---

## 7. Installation et commandes

Prérequis : Node.js ≥ 22.23.4 (champ `engines` de `package.json` ; `.nvmrc` indique la version 22) et npm.

```bash
npm install
npm run dev       # http://localhost:4321
```

| Commande              | Rôle                                                  |
| --------------------- | ----------------------------------------------------- |
| `npm run build`       | Vérifie les types puis génère le site dans `dist/`    |
| `npm run preview`     | Prévisualise le build                                 |
| `npm test`            | Lance les tests unitaires (Vitest)                    |
| `npm run lint`        | Analyse le code (ESLint)                              |
| `npm run format`      | Formate le code (Prettier)                            |
| `npm run import:onet` | Régénère les profils de métiers O*NET (réseau requis) |
| `npm run import:fr`   | Régénère la correspondance O*NET → ROME → RNCP        |
| `npm run doc:sources` | Régénère `docs/sources.md` depuis `sources.json`      |

---

## 8. Méthode de travail attendue (pour Claude Code)

Le propriétaire du projet n'est pas développeur : chaque session doit pouvoir avancer sans explication supplémentaire, en s'appuyant sur ce README, `CLAUDE.md` et `docs/`.

**Au début de chaque session**

1. Lire `README.md`, `CLAUDE.md`, la liste de `docs/decisions/` et la section 10 ci-dessous.
2. Vérifier l'état du dépôt (`git status`, branche courante, PR ouvertes) et lancer `npm test` et `npm run build` pour partir d'une base saine.

**Pendant le travail**

- Pour toute demande importante (nouvelle fonctionnalité, nouveau contenu, changement de structure) : **proposer d'abord un plan** et attendre la validation. Les petites corrections (texte, mise en page) peuvent être faites directement.
- Travailler sur une **branche dédiée** (`etapeN/sujet` ou `fix/sujet`), commits petits et explicites en français, puis ouvrir une **pull request** avec un lien de prévisualisation si disponible.
- Respecter les sections 3 à 5. En cas de doute entre deux options, choisir la plus simple et la plus honnête, et le signaler.
- Vérifier toute source, tout livre, tout dispositif public (CEP, CPF, VAE…) sur une source officielle ; indiquer la date de vérification pour les dispositifs.
- Mettre à jour la documentation en même temps que le code : `CLAUDE.md`, `docs/sources.md`, une nouvelle note dans `docs/decisions/` pour toute décision structurante, et la section 9/10 de ce README.

**Avant de terminer**

- `npm test`, `npm run lint` et `npm run build` doivent passer.
- Vérifier le rendu sur mobile, tablette et ordinateur.
- Chercher les oublis de tutoiement (« tu », « ton », « ta », « tes », « toi ») dans les contenus.
- Fournir un **résumé en français simple** : ce qui est fait, ce qui reste, les sources vérifiées ou non, les brouillons à relire, et les questions qui demandent une décision du propriétaire.

---

## 9. Historique des décisions

| Décision                                                                                      | Détail                                                             |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Modèles Big Five (IPIP) + RIASEC (O*NET)                                                      | Le RIASEC sert au lien avec les métiers                            |
| Deux parcours : rapide (~80 questions) et complet (~180)                                      | `docs/decisions/0004-…`                                            |
| Site statique, tout dans le navigateur, aucune donnée collectée                               | RGPD, confiance                                                    |
| Nom « Personalis » (remplace « Personnalisé »)                                                | Origine du nom sur la page À propos                                |
| Ambiance lumineuse et moderne                                                                 | `docs/decisions/0007-…`                                            |
| Vouvoiement partout                                                                           | Remplace le tutoiement initial                                     |
| « Comprendre » renommé « Explication »                                                        | Avec redirection de l'ancienne URL                                 |
| Règle de simplicité                                                                           | Pas de nouvel onglet sauf nécessité                                |
| Livres : étiquettes, pas de lien d'affiliation, résumés détaillés fournis par le propriétaire | Ne pas réécrire le fond des résumés                                |
| Page « Besoin d'en parler ? » : accompagnement en haut, 3114 en bas, plus petit mais lisible  | Ne pas effrayer, rester accessible                                 |
| README comme référence principale, CLAUDE.md pour les conventions techniques                  | Sections 9 et 10 du README mises à jour à chaque fin de session    |
| Résultats : métiers français (ROME 4.0) et certifications (RNCP), calcul O*NET inchangé       | `docs/decisions/0010-…`, chaîne O*NET → ESCO → ROME officielle     |
| Correspondances affichées : exactes ou approchées seulement, « proches » après relecture      | Relecture dans `docs/controle/`, décisions dans `validations.json` |

---

## 10. Feuille de route et chantiers ouverts

À tenir à jour à la fin de chaque session.

**Avant toute mise en ligne publique (bloquant)**

- [ ] Traductions françaises des items : utiliser une traduction publiée et validée si elle existe, sinon le signaler clairement.
- [ ] Questionnaires O*NET : respecter les conditions de la O*NET Tools Developer License pour une traduction (étude de validation) ou trouver une alternative conforme.
- [ ] Mentions légales complètes (éditeur, hébergeur) et choix de l'hébergeur.

**Contenus**

- [ ] **En cours** : correspondance O*NET → ROME (intitulés et liens adaptés à la France). Fait :
      chaîne officielle O*NET → ESCO → ROME 4.0, 700 métiers O*NET sur 923 avec un équivalent
      français affiché, fiches `/metiers/rome/…`, liens MétierScope et Onisep. Reste :
  - [ ] importer l'export RNCP (data.gouv.fr injoignable depuis l'environnement en ligne :
        `npm run import:fr -- --rncp archive.zip`) et confirmer son format ;
  - [ ] relire les correspondances par ordre de priorité (`docs/controle/correspondances-onet-rome.csv`)
        et reporter les décisions dans `src/data/fr/validations.json` ;
  - [ ] reconfirmer les licences de la table ESCO–ROME, du RNCP et d'Idéo-Métiers (Onisep) ;
  - [ ] relancer `npm run import:fr` à chaque nouvelle version du ROME (prochaine : mars 2027) et
        régulièrement pour le RNCP.
- [ ] Normes de percentiles sourcées pour chaque questionnaire.
- [x] Section « Ma situation » enrichie (11 articles, modèle commun, en brouillon) ; restent à vérifier les dispositifs et chiffres officiels marqués TODO (sites non joignables lors de la rédaction).
- [ ] Relecture des brouillons (pages philosophie, Ma situation, dossier introversion/extraversion).
- [ ] Relecture des 34 fiches livres (toutes encore en `brouillon: true`).
- [ ] Vérification des ISBN et éditions françaises signalés « à vérifier ».

---

## 11. Documentation

- `CLAUDE.md` : principes, conventions de code et organisation détaillée (lu automatiquement par Claude Code).
- `docs/sources.md` : sources, licences et statut de vérification (généré depuis `sources.json`).
- `docs/methodologie-score.md` : règles de calcul des scores.
- `docs/decisions/` : décisions de conception numérotées.

---

## 12. Licences et mention O*NET

- Code : [MIT](LICENSE).
- Contenu : [CC BY 4.0](LICENSE-CONTENU.md).
- Items : International Personality Item Pool, domaine public.
- Données métiers : base O*NET 31.0 (USDOL/ETA), CC BY 4.0 ; ESCO (Commission européenne,
  décision 2011/833/UE) ; ROME 4.0 (France Travail, licence ouverte) ; RNCP (France compétences,
  Licence Ouverte / Etalab 2.0) ; extrait Idéo-Métiers (Onisep, ODbL). Détails : page « Crédits et
  licences ».
- Questionnaires d'intérêts : O*NET Interest Profiler (USDOL/ETA), traduits sous O*NET Tools Developer License. O*NET® est une marque déposée de l'USDOL/ETA.

### Mention O*NET (obligatoire)

This product includes information from the O*NET Career Exploration Tools by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the [O\*NET Tools Developer License](https://www.onetcenter.org/license_toolsdev.html). O*NET® is a trademark of USDOL/ETA. The contributors of this project have modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.

Modifications et avertissements (_modifications and disclaimers_) : page `/modifications-onet` du site (`src/pages/modifications-onet.astro`).
