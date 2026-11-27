#!/usr/bin/env node
/**
 * Importe les profils d'intérêts RIASEC des métiers depuis la base O*NET 31.0
 * (licence CC BY 4.0, https://www.onetcenter.org/license_db.html) et génère
 * src/data/onet/metiers.json.
 *
 * Usage : node scripts/import-onet.mjs
 * Nécessite un accès réseau à www.onetcenter.org.
 *
 * Fichiers utilisés (format CSV) :
 *  - career_interest_types.csv : scores « Occupational Interests » (OI, de 1 à 7) et
 *    « Interest High-Point » (IH, de 0 à 6) ;
 *  - occupation_data.csv : intitulés ;
 *  - job_zones.csv : niveau de préparation (Job Zone, de 1 à 5).
 *
 * Modifications apportées aux données (à signaler, licence CC BY) : sélection de colonnes,
 * exclusion de la famille 55 (« Military Specific », propre aux forces armées américaines),
 * conversion des codes de points hauts en lettres RIASEC.
 */
import { writeFile } from 'node:fs/promises';
import { csvVersObjets } from './lib/csv.mjs';

const VERSION = '31.0';
const BASE = `https://www.onetcenter.org/dl_files/database/db_${VERSION.replace('.', '_')}_csv`;
const SORTIE = new URL('../src/data/onet/metiers.json', import.meta.url);
const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'];
const NOMS = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprising: 'E',
  Conventional: 'C',
};
const FAMILLES_EXCLUES = new Set(['55']);

async function telecharger(nom) {
  const url = `${BASE}/${nom}.csv`;
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`Échec du téléchargement de ${url} : ${reponse.status}`);
  return csvVersObjets(await reponse.text());
}

const [interets, occupations, zones] = await Promise.all([
  telecharger('career_interest_types'),
  telecharger('occupation_data'),
  telecharger('job_zones'),
]);

const titres = new Map(occupations.map((o) => [o['O*NET-SOC Code'], o['Title']]));
const jobZones = new Map(zones.map((z) => [z['O*NET-SOC Code'], Number(z['Job Zone'])]));
const parMetier = new Map();

for (const ligne of interets) {
  const code = ligne['O*NET-SOC Code'];
  if (FAMILLES_EXCLUES.has(code.slice(0, 2))) continue;
  const m = parMetier.get(code) ?? { scores: {}, pointsHauts: [] };
  const valeur = Number(ligne['Data Value']);
  if (ligne['Scale ID'] === 'OI') {
    const lettre = NOMS[ligne['Element Name']];
    if (!lettre) throw new Error(`Dimension inconnue : ${ligne['Element Name']}`);
    m.scores[lettre] = valeur;
  } else if (ligne['Scale ID'] === 'IH') {
    const rang = ['First', 'Second', 'Third'].findIndex((r) => ligne['Element Name'].startsWith(r));
    if (rang >= 0) m.pointsHauts[rang] = valeur;
  }
  parMetier.set(code, m);
}

const metiers = [...parMetier.entries()]
  .filter(([, m]) => RIASEC.every((l) => typeof m.scores[l] === 'number'))
  .map(([code, m]) => ({
    code,
    titre: titres.get(code) ?? code,
    famille: code.slice(0, 2),
    job_zone: jobZones.get(code) ?? null,
    riasec: Object.fromEntries(RIASEC.map((l) => [l, m.scores[l]])),
    // Points hauts : 1 = R … 6 = C ; 0 = pas de point haut.
    code_riasec: m.pointsHauts
      .filter((v) => v >= 1 && v <= 6)
      .map((v) => RIASEC[v - 1])
      .join(''),
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

const donnees = {
  source: 'onet-31',
  version: VERSION,
  genere_le: new Date().toISOString().slice(0, 10),
  attribution:
    'This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the CC BY 4.0 license. O*NET® is a trademark of USDOL/ETA.',
  modifications:
    'Sélection de colonnes, exclusion de la famille 55 (Military Specific), conversion des points hauts en lettres RIASEC.',
  metiers,
};

await writeFile(SORTIE, JSON.stringify(donnees, null, 0) + '\n');
console.log(`${metiers.length} métiers écrits dans ${SORTIE.pathname}`);
