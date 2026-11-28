#!/usr/bin/env node
/**
 * Construit la correspondance entre les métiers O*NET (profils RIASEC, base du calcul) et
 * les métiers français du ROME 4.0, avec les certifications RNCP qui y mènent.
 *
 * Usage :
 *   NODE_USE_ENV_PROXY=1 npm run import:fr                       (tout télécharger)
 *   npm run import:fr -- --rncp chemin/export-fiches-csv-AAAA-MM-JJ.zip
 *                                       (export RNCP téléchargé à la main sur data.gouv.fr)
 *
 * Sources (toutes officielles, téléchargées, jamais « scrapées ») :
 *  1. O*NET → ESCO : « O*NET - ESCO Crosswalk (Occupations) », Commission européenne et
 *     USDOL/ETA, page « Other crosswalks » du portail ESCO ;
 *  2. ESCO → ROME 4.0 : table nationale « ROME 4.0 - ESCO 1.0.9 » de France Travail, page
 *     « EURES countries mapping tables » du portail ESCO ;
 *  3. ROME 4.0 : export open data complet de France Travail (Licence Ouverte) ;
 *  4. RNCP : export de France compétences sur data.gouv.fr (Licence Ouverte / Etalab 2.0) ;
 *  5. Onisep : jeu de données Idéo-Métiers (ODbL), pour les liens vers les fiches Onisep.
 *
 * Fichiers générés :
 *  - src/data/fr/correspondances.json : métiers O*NET → fiches ROME affichées (page de résultats) ;
 *  - src/data/fr/metiers-rome.json : fiches ROME affichées (pages /metiers/rome/[code]) ;
 *  - src/data/fr/onisep-rome.json : extrait Idéo-Métiers (ODbL) code ROME → fiches Onisep ;
 *  - docs/controle/correspondances-onet-rome.csv : fichier de relecture manuelle.
 * Les décisions de relecture sont lues dans src/data/fr/validations.json (jamais écrasé).
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import { analyserCsv, csvVersObjets } from './lib/csv.mjs';
import {
  construireCorrespondances,
  simulerApparitions,
  choisirCertifications,
  lignesApresEntete,
  champCsv,
  lienMetierScope,
} from './lib/correspondance-fr.mjs';
import { lireExportRncp } from './lib/rncp.mjs';

export const URLS = {
  onetEsco: 'https://esco.ec.europa.eu/system/files/2023-08/ONET_%28Occupations%29_0_updated.csv',
  escoRome: 'https://esco.ec.europa.eu/system/files/2025-12/EURESmapping_occs_FR.csv',
  rome: 'https://api.francetravail.fr/api-nomenclatureemploi/v1/open-data/csv',
  onisep: 'https://data.onisep.fr/api/v1/dataset/5fa5949243f97/search?size=5000',
  rncpJeu:
    'https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-certifications-professionnelles-et-repertoire-specifique/',
};

const racine = new URL('../', import.meta.url);
const chemin = (p) => new URL(p, racine);

async function telecharger(url, format = 'texte') {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Échec du téléchargement de ${url} : ${r.status}`);
  if (format === 'octets') return new Uint8Array(await r.arrayBuffer());
  if (format === 'json') return r.json();
  if (format === 'cp1252') return new TextDecoder('windows-1252').decode(await r.arrayBuffer());
  return r.text();
}

const argRncp = process.argv.indexOf('--rncp');
const fichierRncp = argRncp > 0 ? process.argv[argRncp + 1] : null;

console.log('Téléchargement des tables ESCO, du ROME et des données Onisep…');
const [onetEscoTxt, escoRomeTxt, romeZip, onisepJson, metiersOnetJson, validationsJson] =
  await Promise.all([
    telecharger(URLS.onetEsco),
    telecharger(URLS.escoRome, 'cp1252'),
    telecharger(URLS.rome, 'octets'),
    telecharger(URLS.onisep, 'json'),
    readFile(chemin('src/data/onet/metiers.json'), 'utf8').then(JSON.parse),
    readFile(chemin('src/data/fr/validations.json'), 'utf8')
      .then(JSON.parse)
      .catch(() => ({ validations: [] })),
  ]);

// 1. O*NET → ESCO
const onetEsco = lignesApresEntete(analyserCsv(onetEscoTxt), 'O*NET Id').map((l) => ({
  onet: l['O*NET Id'],
  esco: l['ESCO or ISCO URI'],
  escoTitre: l['ESCO or ISCO Title'],
  type: l['Type of Match'],
}));

// 2. ESCO → appellations ROME 4.0
const lignesEscoRome = analyserCsv(escoRomeTxt, ';');
const metaEscoRome = Object.fromEntries(
  lignesEscoRome.slice(0, 15).map((l) => [l[0]?.trim(), l[1]?.trim()]),
);
const escoRome = lignesApresEntete(lignesEscoRome, 'Classification 1 URI').map((l) => ({
  esco: l['Classification 1 URI'],
  ogr: l['Classification 2 ID'],
  type: (l['SKOS values'] ?? '').replace(/^skos:/, ''),
}));

// 3. ROME 4.0
const zip = unzipSync(romeZip);
const fichierRome = (motif) => {
  const nom = Object.keys(zip).find((n) => motif.test(n));
  if (!nom) throw new Error(`ROME : fichier ${motif} absent de l'archive`);
  return strFromU8(zip[nom]);
};
const versionRome = fichierRome(/version\.txt$/);
const numeroVersion = /Numero de version\s*:\s*(\S+)/.exec(versionRome)?.[1] ?? null;
const titreVersion = /Titre\/commentaire\s*:\s*(.+)/.exec(versionRome)?.[1]?.trim() ?? null;
const datePublication = /Date de publication\s*:\s*(\S+)/.exec(versionRome)?.[1] ?? null;
const appellations = csvVersObjets(fichierRome(/referentiel_appellation_v\d+_utf8\.csv$/));
const codesRome = csvVersObjets(fichierRome(/referentiel_code_rome_v\d+_utf8\.csv$/));
const riasecRome = csvVersObjets(fichierRome(/referentiel_code_rome_riasec_v\d+_utf8\.csv$/));
const textes = csvVersObjets(fichierRome(/unix_texte_v\d+_utf8\.csv$/));
const grandsDomaines = new Map(
  csvVersObjets(fichierRome(/unix_grand_domaine_v\d+_utf8\.csv$/)).map((g) => [
    g.code_grand_domaine,
    g.libelle_grand_domaine.trim(),
  ]),
);

const nettoyer = (t) => t.replace(/''/g, '’').replace(/'/g, '’').replace(/\s+/g, ' ').trim();
const appellationVersFiche = new Map(appellations.map((a) => [a.code_ogr, a.code_rome]));
const libellesAppellations = new Map(
  appellations.map((a) => [a.code_ogr, nettoyer(a.libelle_appellation_long)]),
);
const riasecParFiche = new Map(
  riasecRome.map((r) => [r.code_rome, { majeur: r.riasec_majeur, mineur: r.riasec_mineur }]),
);
const fiches = new Map(
  codesRome.map((c) => [
    c.code_rome,
    { libelle: nettoyer(c.libelle_rome), riasec: riasecParFiche.get(c.code_rome) },
  ]),
);
const textesParFiche = new Map();
for (const t of textes) {
  const e = textesParFiche.get(t.code_rome) ?? { definition: [], acces_metier: [] };
  e[t.libelle_type_texte]?.push([Number(t.position_phrase), nettoyer(t.libelle_texte)]);
  textesParFiche.set(t.code_rome, e);
}
const phrases = (l) => l.sort((a, b) => a[0] - b[0]).map((x) => x[1]);

// 4. Onisep (Idéo-Métiers, ODbL) : code ROME → fiches Onisep
const onisepParRome = new Map();
let onisepMaj = '';
for (const r of onisepJson.results ?? []) {
  if (!r.code_rome || !r.lien_site_onisepfr) continue;
  if ((r.date_de_modification ?? '') > onisepMaj) onisepMaj = r.date_de_modification;
  const l = onisepParRome.get(r.code_rome) ?? new Map();
  l.set(r.lien_site_onisepfr, { libelle: r.libelle_metier, lien: r.lien_site_onisepfr });
  onisepParRome.set(r.code_rome, l);
}
if (onisepJson.total !== (onisepJson.results ?? []).length) {
  throw new Error(
    `Onisep : ${onisepJson.total} lignes annoncées, ${onisepJson.results.length} reçues`,
  );
}

// 5. RNCP
let certifications = null;
let versionRncp;
try {
  let octets;
  if (fichierRncp) {
    octets = new Uint8Array(await readFile(fichierRncp));
    versionRncp = { fichier: fichierRncp.split('/').pop(), url: null };
  } else {
    const jeu = await telecharger(URLS.rncpJeu, 'json');
    const ressource = jeu.resources
      .filter((r) => /csv/i.test(r.title) && /\.zip$/i.test(r.url))
      .sort((a, b) => b.last_modified.localeCompare(a.last_modified))[0];
    if (!ressource) throw new Error('aucune archive CSV dans le jeu de données');
    octets = await telecharger(ressource.url, 'octets');
    versionRncp = {
      fichier: ressource.title,
      url: ressource.url,
      modifie: ressource.last_modified,
    };
  }
  const contenu = unzipSync(octets);
  certifications = lireExportRncp(
    Object.entries(contenu)
      .filter(([nom]) => /\.csv$/i.test(nom))
      .map(([nom, o]) => ({ nom, texte: strFromU8(o) })),
  );
  console.log(
    `RNCP : ${certifications.length} fiches lues, ${certifications.filter((c) => c.actif).length} actives`,
  );
} catch (e) {
  console.warn(`\n⚠ RNCP non importé : ${e.message}`);
  console.warn('  Les fiches métiers afficheront « certifications en cours d’import ».\n');
  versionRncp = null;
}

// Construction de la correspondance
const metiersOnet = metiersOnetJson.metiers;
const table = construireCorrespondances({
  metiersOnet,
  onetEsco,
  escoRome,
  appellationVersFiche,
  fiches,
  validations: validationsJson.validations,
  libellesAppellations,
});
const apparitions = simulerApparitions(metiersOnet);

const correspondances = {};
const fichesAffichees = new Map();
for (const m of metiersOnet) {
  const affichees = table.get(m.code).filter((c) => c.affiche);
  if (affichees.length === 0) continue;
  correspondances[m.code] = affichees.map((c) => ({
    rome: c.rome,
    qualite: c.qualite,
    statut: c.statut,
    ...(c.appellation ? { appellation: c.appellation.code } : {}),
  }));
  for (const c of affichees) {
    const f = fichesAffichees.get(c.rome) ?? [];
    f.push({
      code: m.code,
      titre: m.titre,
      qualite: c.qualite,
      statut: c.statut,
      ...(c.appellation ? { appellation: c.appellation.libelle } : {}),
    });
    fichesAffichees.set(c.rome, f);
  }
}

const date = new Date().toISOString().slice(0, 10);
const versions = {
  onet_esco: {
    titre: 'O*NET - ESCO Crosswalk (Occupations), version 1 (sept. 2022)',
    url: URLS.onetEsco,
  },
  esco_rome: {
    titre: `${metaEscoRome['Mapping project name']} ${metaEscoRome['Mapping project version']} (${metaEscoRome['Mapping project version date']})`,
    rome: metaEscoRome['Classification 2 Version'] ?? null,
    url: URLS.escoRome,
  },
  rome: { version: numeroVersion, titre: titreVersion, publie_le: datePublication, url: URLS.rome },
  onisep: { modifie_le: onisepMaj.slice(0, 10) || null, url: URLS.onisep },
  rncp: versionRncp,
};

const metiersRome = {};
for (const [code, onet] of [...fichesAffichees.entries()].sort()) {
  const f = fiches.get(code);
  const t = textesParFiche.get(code) ?? { definition: [], acces_metier: [] };
  metiersRome[code] = {
    code,
    libelle: f.libelle,
    grand_domaine: grandsDomaines.get(code[0]) ?? null,
    definition: phrases(t.definition),
    acces_metier: phrases(t.acces_metier),
    riasec: f.riasec ?? null,
    lien_metierscope: lienMetierScope(code),
    certifications: certifications ? choisirCertifications(certifications, code) : null,
    onet: onet.sort((a, b) => a.code.localeCompare(b.code)),
  };
}

const onisep = {};
for (const code of Object.keys(metiersRome)) {
  const l = onisepParRome.get(code);
  if (l) onisep[code] = [...l.values()].sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'));
}

await mkdir(chemin('src/data/fr'), { recursive: true });
await mkdir(chemin('docs/controle'), { recursive: true });
const ecrireJson = (p, v) => writeFile(chemin(p), `${JSON.stringify(v, null, 2)}\n`);

await ecrireJson('src/data/fr/correspondances.json', {
  genere_le: date,
  versions,
  note: 'Métiers O*NET → fiches ROME 4.0 affichées. Généré par scripts/import-fr.mjs : ne pas modifier à la main (utiliser validations.json).',
  correspondances,
  libelles: Object.fromEntries(Object.values(metiersRome).map((f) => [f.code, f.libelle])),
  appellations: Object.fromEntries(
    Object.values(correspondances)
      .flat()
      .filter((l) => l.appellation)
      .map((l) => [l.appellation, libellesAppellations.get(l.appellation)]),
  ),
});
await ecrireJson('src/data/fr/metiers-rome.json', {
  genere_le: date,
  versions,
  attribution:
    'Données ROME : France Travail (ROME 4.0), Licence Ouverte. Certifications : France compétences (RNCP), Licence Ouverte / Etalab 2.0.',
  fiches: metiersRome,
});
await ecrireJson('src/data/fr/onisep-rome.json', {
  genere_le: date,
  licence: 'ODbL 1.0',
  attribution:
    'Extrait du jeu de données Idéo-Métiers Onisep (Onisep), sous licence ODbL : sélection des colonnes libellé, lien et code ROME. Cet extrait reste sous ODbL.',
  source: URLS.onisep,
  modifie_le: versions.onisep.modifie_le,
  fiches: onisep,
});

// Fichier de relecture (point-virgule, UTF-8 avec BOM pour les tableurs)
const colonnes = [
  'priorite',
  'apparitions_simulees',
  'onet_code',
  'onet_titre',
  'onet_riasec',
  'rome_code',
  'rome_libelle',
  'appellation_affichee',
  'rome_riasec',
  'coherence_riasec',
  'qualite',
  'chemins',
  'esco_intermediaires',
  'affiche',
  'raison',
  'statut',
  'note',
];
const lignes = [];
for (const m of metiersOnet) {
  const n = apparitions.get(m.code) ?? 0;
  const liste = table.get(m.code);
  if (liste.length === 0) {
    lignes.push({ n, m, c: null });
  } else for (const c of liste) lignes.push({ n, m, c });
}
lignes.sort((a, b) => b.n - a.n || a.m.code.localeCompare(b.m.code));
const rangs = new Map([...new Set(lignes.map((l) => l.m.code))].map((code, i) => [code, i + 1]));
const csv = [colonnes.join(';')];
for (const { n, m, c } of lignes) {
  const r = c ? fiches.get(c.rome)?.riasec : null;
  csv.push(
    [
      rangs.get(m.code),
      n,
      m.code,
      m.titre,
      m.code_riasec,
      c?.rome ?? '',
      c?.libelle ?? '',
      c?.appellation?.libelle ?? '',
      r ? `${r.majeur}${r.mineur}` : '',
      c ? (c.coherence === null ? 'inconnue' : c.coherence ? 'oui' : 'non') : '',
      c?.qualite ?? 'absente',
      c?.chemins.join(' | ') ?? '',
      c?.esco.join(' | ') ?? '',
      c?.affiche ? 'oui' : 'non',
      c?.raison ?? 'aucune correspondance dans les tables officielles',
      c?.statut ?? 'a_valider',
      c?.note ?? '',
    ]
      .map(champCsv)
      .join(';'),
  );
}
await writeFile(chemin('docs/controle/correspondances-onet-rome.csv'), `\uFEFF${csv.join('\n')}\n`);

// Bilan
const total = metiersOnet.length;
const couverts = Object.keys(correspondances).length;
const parQualite = {};
for (const m of metiersOnet) {
  const meilleure = table.get(m.code)[0]?.qualite ?? 'absente';
  parQualite[meilleure] = (parQualite[meilleure] ?? 0) + 1;
}
console.log(`ROME ${titreVersion} · table ESCO–ROME ${versions.esco_rome.titre}`);
console.log(`Métiers O*NET avec au moins une fiche ROME affichée : ${couverts}/${total}`);
console.log(`Meilleure qualité par métier O*NET : ${JSON.stringify(parQualite)}`);
console.log(`Fiches ROME affichées : ${Object.keys(metiersRome).length}`);
console.log(`Fiches avec lien Onisep : ${Object.keys(onisep).length}`);

// Garde-fou : la taille des fichiers générés reste raisonnable pour un site statique.
for (const f of await readdir(chemin('src/data/fr/'))) {
  const s = await stat(chemin(`src/data/fr/${f}`));
  console.log(`  ${f} : ${Math.round(s.size / 1024)} Ko`);
}
