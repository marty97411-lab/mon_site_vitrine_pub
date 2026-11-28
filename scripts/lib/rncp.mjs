/**
 * Lecture de l'export CSV des répertoires nationaux (RNCP et RS) publié par France
 * compétences sur data.gouv.fr (Licence Ouverte / Etalab 2.0).
 *
 * ATTENTION (28/11/2026) : data.gouv.fr n'était pas joignable depuis l'environnement de
 * développement ; le format exact de l'export n'a donc pas pu être observé. Les noms de
 * colonnes ci-dessous sont ceux annoncés par la documentation et les discussions publiques
 * du jeu de données, À CONFIRMER au premier import réel. Si une colonne manque, la lecture
 * s'arrête avec la liste des colonnes trouvées : on n'invente jamais de valeur.
 */
import { csvVersObjets } from './csv.mjs';

/** Noms de colonnes acceptés pour chaque information (le premier trouvé est utilisé). */
export const COLONNES = {
  numero: ['Numero_Fiche', 'numero_fiche', 'Num_Fiche'],
  intitule: ['Intitule', 'intitule', 'Intitulé'],
  niveau: ['Nomenclature_Europe_Niveau', 'nomenclature_europe_niveau', 'Niveau'],
  actif: ['Actif', 'actif', 'Etat_Fiche'],
  codeRome: ['Codes_Rome_Code', 'codes_rome_code', 'Code_Rome'],
};

/** @param {Record<string,string>[]} lignes @param {string[]} noms @param {string} quoi */
function colonne(lignes, noms, quoi, fichier) {
  const entete = Object.keys(lignes[0] ?? {});
  const nom = noms.find((n) => entete.includes(n));
  if (!nom) {
    throw new Error(
      `RNCP : colonne « ${quoi} » introuvable dans ${fichier}. Colonnes présentes : ${entete.join(', ')}`,
    );
  }
  return nom;
}

/** « NIV5 », « 5 », « Niveau 5 » → 5 ; sinon null (pas de niveau pour certaines fiches). */
export function lireNiveau(valeur) {
  const m = /([3-8])\s*$/.exec(String(valeur ?? '').trim());
  return m ? Number(m[1]) : null;
}

/** Une fiche est active si l'export l'indique explicitement ; tout autre état est exclu. */
export function lireActif(valeur) {
  return ['ACTIVE', 'ACTIF', 'OUI', 'O', 'TRUE', '1'].includes(
    String(valeur ?? '')
      .trim()
      .toUpperCase(),
  );
}

/**
 * @param {{ nom: string, texte: string }[]} fichiers fichiers CSV extraits de l'archive
 * @returns {{ numero: string, intitule: string, niveau: number|null, actif: boolean, codesRome: string[] }[]}
 */
export function lireExportRncp(fichiers) {
  const standard = fichiers.find((f) => /standard/i.test(f.nom));
  const rome = fichiers.find((f) => /rome/i.test(f.nom));
  if (!standard || !rome) {
    throw new Error(
      `RNCP : fichiers « Standard » et « Rome » attendus dans l'archive, trouvés : ${fichiers
        .map((f) => f.nom)
        .join(', ')}`,
    );
  }
  const sep = (t) => (t.split('\n', 1)[0].includes(';') ? ';' : ',');
  const lignesStd = csvVersObjets(standard.texte, sep(standard.texte));
  const lignesRome = csvVersObjets(rome.texte, sep(rome.texte));
  const cNum = colonne(lignesStd, COLONNES.numero, 'numéro', standard.nom);
  const cInt = colonne(lignesStd, COLONNES.intitule, 'intitulé', standard.nom);
  const cNiv = colonne(lignesStd, COLONNES.niveau, 'niveau', standard.nom);
  const cAct = colonne(lignesStd, COLONNES.actif, 'état actif', standard.nom);
  const cNumR = colonne(lignesRome, COLONNES.numero, 'numéro', rome.nom);
  const cRome = colonne(lignesRome, COLONNES.codeRome, 'code ROME', rome.nom);

  const codes = new Map();
  for (const l of lignesRome) {
    const n = l[cNumR].trim();
    const c = l[cRome].trim();
    if (!n || !/^[A-Z]\d{4}$/.test(c)) continue;
    codes.set(n, new Set([...(codes.get(n) ?? []), c]));
  }
  // Une même fiche peut apparaître sur plusieurs lignes : on garde la première, et elle n'est
  // active que si toutes ses lignes le disent (prudence).
  const fiches = new Map();
  for (const l of lignesStd) {
    const numero = l[cNum].trim();
    if (!numero) continue;
    const actif = lireActif(l[cAct]);
    const deja = fiches.get(numero);
    if (deja) {
      deja.actif = deja.actif && actif;
      continue;
    }
    fiches.set(numero, {
      numero,
      intitule: l[cInt].trim(),
      niveau: lireNiveau(l[cNiv]),
      actif,
      codesRome: [...(codes.get(numero) ?? [])].sort(),
    });
  }
  return [...fiches.values()];
}
