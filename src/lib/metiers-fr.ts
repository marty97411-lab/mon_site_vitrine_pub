/**
 * Libellés d'affichage des métiers français (ROME) et des certifications (RNCP).
 * Niveaux : cadre national des certifications professionnelles (décret n° 2019-14).
 */
export type QualiteCorrespondance = 'exacte' | 'approchee' | 'incertaine' | 'proche' | 'manuelle';

export const LIBELLES_QUALITE: Record<QualiteCorrespondance, string> = {
  exacte: 'correspondance exacte',
  approchee: 'correspondance approchée',
  incertaine: 'correspondance incertaine',
  proche: 'métier proche',
  manuelle: 'ajoutée à la relecture',
};

export const NIVEAUX_CERTIFICATION: Record<number, string> = {
  3: 'niveau 3 (CAP, BEP)',
  4: 'niveau 4 (bac)',
  5: 'niveau 5 (bac + 2)',
  6: 'niveau 6 (bac + 3 ou 4)',
  7: 'niveau 7 (bac + 5)',
  8: 'niveau 8 (doctorat)',
};

/** « 2026-10-05 » → « 05/10/2026 » ; toute autre valeur est rendue telle quelle. */
export function dateFr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}
