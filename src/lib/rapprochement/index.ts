/**
 * Rapprochement entre le profil d'intérêts d'une personne et ceux des métiers O*NET,
 * selon la méthode décrite dans le manuel de l'O*NET Interest Profiler (2021, chapitre 2) :
 * corrélation de Pearson entre les deux profils RIASEC (similarité de forme, pas de niveau),
 * puis seuils r ≥ 0,729 (« Best Fit ») et 0,608 ≤ r < 0,729 (« Great Fit »).
 * Voir docs/decisions/0005-rapprochement-correlation-onet.md.
 */
import { RIASEC, type RiasecId } from '../big-five';

export type ProfilRiasecNum = Record<RiasecId, number>;

export const SEUIL_TRES_FORTE = 0.729;
export const SEUIL_FORTE = 0.608;

export type NiveauCorrespondance = 'tres-forte' | 'forte' | 'moderee';

export const LIBELLES_NIVEAU: Record<NiveauCorrespondance, string> = {
  'tres-forte': 'Correspondance très forte',
  forte: 'Correspondance forte',
  moderee: 'Correspondance modérée',
};

/**
 * Corrélation de Pearson entre deux profils de même longueur.
 * Renvoie null si l'un des profils est plat (écart-type nul) : la forme n'est pas définie.
 */
export function correlation(x: readonly number[], y: readonly number[]): number | null {
  if (x.length !== y.length || x.length < 2) {
    throw new RangeError('Les profils doivent avoir la même longueur (au moins 2)');
  }
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = (x[i] as number) - mx;
    const dy = (y[i] as number) - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

/** Niveau de correspondance selon les seuils O*NET ; null pour une corrélation négative. */
export function niveauCorrespondance(r: number): NiveauCorrespondance | null {
  if (r >= SEUIL_TRES_FORTE) return 'tres-forte';
  if (r >= SEUIL_FORTE) return 'forte';
  if (r >= 0) return 'moderee';
  return null;
}

export const versVecteur = (p: ProfilRiasecNum): number[] => RIASEC.map((l) => p[l]);

export interface MetierProfil {
  code: string;
  famille: string;
  riasec: ProfilRiasecNum;
}

export interface Correspondance<M extends MetierProfil> {
  metier: M;
  r: number;
  niveau: NiveauCorrespondance;
}

export type ResultatRapprochement<M extends MetierProfil> =
  | { statut: 'ok'; correspondances: Correspondance<M>[] }
  /** Profil plat : toutes les dimensions ont le même score, aucune forme à comparer. */
  | { statut: 'profil-plat' };

/** Classe les métiers par corrélation décroissante, en écartant les corrélations négatives. */
export function rapprocher<M extends MetierProfil>(
  personne: ProfilRiasecNum,
  metiers: readonly M[],
): ResultatRapprochement<M> {
  const x = versVecteur(personne);
  if (new Set(x).size === 1) return { statut: 'profil-plat' };
  const correspondances: Correspondance<M>[] = [];
  for (const metier of metiers) {
    const r = correlation(x, versVecteur(metier.riasec));
    if (r === null) continue;
    const niveau = niveauCorrespondance(r);
    if (niveau !== null) correspondances.push({ metier, r, niveau });
  }
  correspondances.sort((a, b) => b.r - a.r || a.metier.code.localeCompare(b.metier.code));
  return { statut: 'ok', correspondances };
}

export interface FamilleRapprochee<M extends MetierProfil> {
  famille: string;
  meilleurR: number;
  niveau: NiveauCorrespondance;
  metiers: Correspondance<M>[];
}

/**
 * Regroupe les correspondances par famille de métiers (grand groupe SOC).
 * Choix de présentation du projet : les familles sont triées selon leur métier le mieux
 * classé, et chacune garde au plus `parFamille` métiers.
 */
export function regrouperParFamille<M extends MetierProfil>(
  correspondances: readonly Correspondance<M>[],
  parFamille = 5,
): FamilleRapprochee<M>[] {
  const familles = new Map<string, FamilleRapprochee<M>>();
  for (const c of correspondances) {
    const f = familles.get(c.metier.famille);
    if (f) {
      if (f.metiers.length < parFamille) f.metiers.push(c);
    } else {
      familles.set(c.metier.famille, {
        famille: c.metier.famille,
        meilleurR: c.r,
        niveau: c.niveau,
        metiers: [c],
      });
    }
  }
  return [...familles.values()].sort((a, b) => b.meilleurR - a.meilleurR);
}
