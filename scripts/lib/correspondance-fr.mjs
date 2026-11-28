/**
 * Logique pure de la correspondance O*NET → ESCO → ROME 4.0 → RNCP (sans accès réseau).
 * Utilisée par scripts/import-fr.mjs ; testée par correspondance-fr.test.mjs.
 * Voir docs/decisions/0010-metiers-francais-rome-rncp.md.
 *
 * Convention des deux tables (vérifiée dans le rapport technique ESCO–O*NET, 2022, et
 * cohérente avec les exemples de la table France Travail) : « A broadMatch B » signifie que
 * le concept A (colonne de gauche) est plus large que B ; « narrowMatch », plus étroit.
 */

/** Types de lien conservés tels quels depuis les tables officielles. */
export const TYPES = ['exactMatch', 'narrowMatch', 'broadMatch', 'closeMatch', 'exactISCO'];

/**
 * Qualité d'une chaîne O*NET → ESCO → appellation ROME.
 * - exacte : deux liens exacts ;
 * - approchee : un lien exact et un lien plus large/plus étroit, ou deux liens dans le même
 *   sens (l'appellation est alors clairement plus large, ou plus précise, que le métier O*NET) ;
 * - incertaine : deux liens en sens opposés (on ne sait plus comment les deux métiers se situent) ;
 * - proche : au moins un lien « closeMatch », ou un lien O*NET vers un simple groupe ISCO.
 * @param {string} t1 type O*NET → ESCO
 * @param {string} t2 type ESCO → ROME
 * @returns {'exacte'|'approchee'|'incertaine'|'proche'}
 */
export function qualiteChaine(t1, t2) {
  if (!TYPES.includes(t1) || !TYPES.includes(t2) || t2 === 'exactISCO') {
    throw new Error(`Type de correspondance inconnu : ${t1} / ${t2}`);
  }
  if (t1 === 'closeMatch' || t2 === 'closeMatch' || t1 === 'exactISCO') return 'proche';
  if (t1 === 'exactMatch' && t2 === 'exactMatch') return 'exacte';
  if (t1 === 'exactMatch' || t2 === 'exactMatch' || t1 === t2) return 'approchee';
  return 'incertaine';
}

export const RANG_QUALITE = { validee: -1, exacte: 0, approchee: 1, incertaine: 2, proche: 3 };

/** Qualités affichées sans relecture (décision du propriétaire, ADR 0010). */
export const QUALITES_AFFICHABLES = new Set(['exacte', 'approchee']);

/** Nombre maximal de fiches ROME affichées pour un même métier O*NET. */
export const MAX_FICHES_PAR_METIER = 3;

/**
 * Cohérence entre le code RIASEC du métier O*NET (points hauts, ex. « EC ») et celui que le
 * ROME 4.0 attribue à la fiche (majeur, mineur). Deux sources officielles indépendantes :
 * - true : la dimension majeure ROME figure dans le code O*NET, ou la première lettre O*NET
 *   est la majeure ou la mineure ROME ;
 * - false : aucun recouvrement de ce type ;
 * - null : l'une des deux informations manque.
 * @param {string} codeOnet
 * @param {{ majeur: string, mineur: string } | undefined} rome
 * @returns {boolean|null}
 */
export function coherenceRiasec(codeOnet, rome) {
  if (!codeOnet || !rome || !rome.majeur) return null;
  if (codeOnet.includes(rome.majeur)) return true;
  const premiere = codeOnet[0];
  return premiere === rome.majeur || premiere === rome.mineur;
}

/**
 * Construit, pour chaque métier O*NET, la liste des fiches ROME candidates.
 * @param {object} p
 * @param {{ code: string, titre: string, code_riasec: string }[]} p.metiersOnet
 * @param {{ onet: string, esco: string, escoTitre: string, type: string }[]} p.onetEsco
 * @param {{ esco: string, ogr: string, type: string }[]} p.escoRome
 * @param {Map<string, string>} p.appellationVersFiche code OGR → code ROME (ROME 4.0)
 * @param {Map<string, { libelle: string, riasec?: { majeur: string, mineur: string } }>} p.fiches
 * @param {{ onet: string, rome: string, decision: 'valide'|'rejete', note?: string }[]} p.validations
 */
export function construireCorrespondances({
  metiersOnet,
  onetEsco,
  escoRome,
  appellationVersFiche,
  fiches,
  validations,
}) {
  const parOnet = groupe(onetEsco, (l) => l.onet);
  const parEsco = groupe(escoRome, (l) => l.esco);
  const decisions = new Map(validations.map((v) => [`${v.onet}|${v.rome}`, v]));
  for (const v of validations) {
    if (!fiches.has(v.rome)) throw new Error(`Validation : code ROME inconnu ${v.rome}`);
    if (!['valide', 'rejete'].includes(v.decision)) {
      throw new Error(`Validation : décision inconnue « ${v.decision} » (${v.onet})`);
    }
  }

  /** @type {Map<string, object[]>} */
  const resultat = new Map();
  for (const m of metiersOnet) {
    /** @type {Map<string, { rome: string, qualite: string, chemins: string[], esco: Set<string> }>} */
    const candidats = new Map();
    for (const l1 of parOnet.get(m.code) ?? []) {
      for (const l2 of parEsco.get(l1.esco) ?? []) {
        const rome = appellationVersFiche.get(l2.ogr);
        if (!rome || !fiches.has(rome)) continue; // appellation absente du ROME actuel
        const q = qualiteChaine(l1.type, l2.type);
        const c = candidats.get(rome) ?? { rome, qualite: q, chemins: [], esco: new Set() };
        if (RANG_QUALITE[q] < RANG_QUALITE[c.qualite]) c.qualite = q;
        c.chemins.push(`${l1.type}>${l2.type}`);
        c.esco.add(l1.escoTitre);
        candidats.set(rome, c);
      }
    }
    // Correspondances ajoutées à la main (absentes de la chaîne automatique).
    for (const v of validations) {
      if (v.onet === m.code && v.decision === 'valide' && !candidats.has(v.rome)) {
        candidats.set(v.rome, { rome: v.rome, qualite: 'manuelle', chemins: [], esco: new Set() });
      }
    }

    const liste = [...candidats.values()].map((c) => {
      const fiche = fiches.get(c.rome);
      const decision = decisions.get(`${m.code}|${c.rome}`);
      const coherence = coherenceRiasec(m.code_riasec, fiche?.riasec);
      return {
        rome: c.rome,
        libelle: fiche?.libelle ?? c.rome,
        qualite: c.qualite,
        chemins: c.chemins,
        soutien: c.chemins.length,
        esco: [...c.esco].sort(),
        coherence,
        statut: decision ? (decision.decision === 'valide' ? 'valide' : 'rejete') : 'a_valider',
        note: decision?.note ?? '',
      };
    });
    resultat.set(m.code, choisirAffichage(liste));
  }
  return resultat;
}

/**
 * Décide quelles fiches sont affichées pour un métier O*NET et pourquoi.
 * Règles (ADR 0010) : une correspondance validée est toujours affichée, une rejetée jamais ;
 * sinon, seules les qualités exacte et approchée sont retenues (une approchée est écartée si
 * les codes RIASEC O*NET et ROME se contredisent ; une exacte est gardée, la divergence restant
 * signalée dans le fichier de relecture), triées par qualité, cohérence RIASEC puis nombre de
 * chemins, au plus 3.
 * @param {object[]} liste
 */
export function choisirAffichage(liste) {
  const trie = [...liste].sort(
    (a, b) =>
      rangStatut(a) - rangStatut(b) ||
      RANG_QUALITE[a.qualite === 'manuelle' ? 'validee' : a.qualite] -
        RANG_QUALITE[b.qualite === 'manuelle' ? 'validee' : b.qualite] ||
      rangCoherence(a.coherence) - rangCoherence(b.coherence) ||
      b.soutien - a.soutien ||
      a.rome.localeCompare(b.rome),
  );
  let places = MAX_FICHES_PAR_METIER;
  return trie.map((c) => {
    let affiche = false;
    let raison;
    if (c.statut === 'rejete') raison = 'rejetée à la relecture';
    else if (c.statut === 'valide') {
      affiche = true;
      raison = 'validée à la relecture';
    } else if (!QUALITES_AFFICHABLES.has(c.qualite)) raison = `qualité ${c.qualite}`;
    else if (c.coherence === false && c.qualite !== 'exacte') {
      raison = 'codes RIASEC O*NET et ROME incompatibles';
    } else if (places <= 0) raison = `au-delà des ${MAX_FICHES_PAR_METIER} meilleures`;
    else {
      affiche = true;
      raison = 'automatique, non relue';
    }
    if (affiche && c.statut !== 'valide') places--;
    return { ...c, affiche, raison };
  });
}

const rangStatut = (c) => (c.statut === 'valide' ? 0 : c.statut === 'a_valider' ? 1 : 2);
const rangCoherence = (v) => (v === true ? 0 : v === null ? 1 : 2);

/** Libellés des niveaux du cadre national des certifications (décret du 8 janvier 2019). */
export const NIVEAUX_CERTIFICATION = {
  3: 'niveau 3 (CAP, BEP)',
  4: 'niveau 4 (bac)',
  5: 'niveau 5 (bac + 2)',
  6: 'niveau 6 (bac + 3 ou 4)',
  7: 'niveau 7 (bac + 5)',
  8: 'niveau 8 (doctorat)',
};

/** Nombre maximal de certifications affichées par fiche ROME. */
export const MAX_CERTIFICATIONS = 5;

/**
 * Choisit les certifications RNCP affichées pour une fiche ROME.
 * Règle éditoriale (ADR 0010) : fiches RNCP actives uniquement ; d'abord les plus spécifiques
 * (rattachées au plus petit nombre de codes ROME), puis par niveau croissant, puis les numéros
 * les plus récents ; au plus 5.
 * @param {{ numero: string, intitule: string, niveau: number|null, actif: boolean, codesRome: string[] }[]} certifications
 * @param {string} codeRome
 */
export function choisirCertifications(certifications, codeRome) {
  return certifications
    .filter((c) => c.actif && /^RNCP\d+$/.test(c.numero) && c.codesRome.includes(codeRome))
    .sort(
      (a, b) =>
        a.codesRome.length - b.codesRome.length ||
        (a.niveau ?? 99) - (b.niveau ?? 99) ||
        Number(b.numero.slice(4)) - Number(a.numero.slice(4)),
    )
    .slice(0, MAX_CERTIFICATIONS)
    .map((c) => ({
      numero: c.numero,
      intitule: c.intitule,
      niveau: c.niveau,
      lien: lienRncp(c.numero),
    }));
}

/** Lien vers la fiche officielle (format vérifié sur francecompetences.fr le 28/11/2026). */
export const lienRncp = (numero) =>
  `https://www.francecompetences.fr/recherche/rncp/${numero.replace(/^RNCP/, '')}/`;

/** Lien MétierScope (format présent dans les données officielles Onisep et France Travail). */
export const lienMetierScope = (codeRome) =>
  `https://candidat.francetravail.fr/metierscope/fiche-metier/${codeRome}`;

/**
 * Corrélation de Pearson (même formule que src/lib/rapprochement, recopiée ici car les
 * scripts Node n'importent pas le TypeScript du site ; un test vérifie l'égalité).
 * @param {number[]} x
 * @param {number[]} y
 */
export function pearson(x, y) {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy);
}

const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'];

/**
 * Estime la fréquence d'affichage de chaque métier O*NET pour prioriser la relecture.
 * Simulation déterministe : les 120 ordres possibles de trois dimensions dominantes
 * (scores 3, 2, 1, les autres à 0) ; pour chacun, on reprend la présentation de la page de
 * résultats (6 familles, 5 métiers par famille, corrélation ≥ 0). Ce n'est pas une mesure
 * de l'usage réel du site (aucune donnée n'est collectée).
 * @param {{ code: string, famille: string, riasec: Record<string, number> }[]} metiers
 * @returns {Map<string, number>}
 */
export function simulerApparitions(metiers, familles = 6, parFamille = 5) {
  const compte = new Map();
  for (const a of RIASEC)
    for (const b of RIASEC)
      for (const c of RIASEC) {
        if (a === b || b === c || a === c) continue;
        const profil = RIASEC.map((l) => (l === a ? 3 : l === b ? 2 : l === c ? 1 : 0));
        const classes = metiers
          .map((m) => ({
            m,
            r: pearson(
              profil,
              RIASEC.map((l) => m.riasec[l]),
            ),
          }))
          .filter((x) => x.r !== null && x.r >= 0)
          .sort((x, y) => y.r - x.r || x.m.code.localeCompare(y.m.code));
        const parFam = new Map();
        for (const x of classes) {
          const l = parFam.get(x.m.famille) ?? [];
          if (l.length < parFamille) l.push(x.m.code);
          parFam.set(x.m.famille, l);
        }
        for (const l of [...parFam.values()].slice(0, familles)) {
          for (const code of l) compte.set(code, (compte.get(code) ?? 0) + 1);
        }
      }
  return compte;
}

/** Échappe une valeur pour un CSV (séparateur point-virgule, lisible dans un tableur français). */
export function champCsv(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Lit les lignes de données d'une table de correspondance au format ESCO (en-tête de
 * métadonnées puis une ligne d'en-têtes de colonnes).
 * @param {string[][]} lignes
 * @param {string} premiereColonne libellé de la première colonne d'en-tête
 */
export function lignesApresEntete(lignes, premiereColonne) {
  const i = lignes.findIndex((l) => (l[0] ?? '').trim() === premiereColonne);
  if (i < 0) throw new Error(`En-tête « ${premiereColonne} » introuvable`);
  const entete = lignes[i].map((c) => c.trim());
  return lignes
    .slice(i + 1)
    .filter((l) => l.some((c) => c.trim() !== ''))
    .map((l) => Object.fromEntries(entete.map((nom, j) => [nom, (l[j] ?? '').trim()])));
}

/** @template T @param {T[]} liste @param {(x: T) => string} cle */
function groupe(liste, cle) {
  const m = new Map();
  for (const x of liste) {
    const k = cle(x);
    const l = m.get(k);
    if (l) l.push(x);
    else m.set(k, [x]);
  }
  return m;
}
