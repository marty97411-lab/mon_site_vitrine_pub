/**
 * Calculs géométriques des graphiques de résultats (fonctions pures, testées).
 * L'hexagone RIASEC suit l'ordre de Holland : R en haut, puis I, A, S, E, C dans le sens horaire.
 */
import { RIASEC, type RiasecId } from './big-five';

export type Point = { x: number; y: number };

/** Sommet de l'axe `index` (0 à 5) à la distance `r` du centre, R en haut. */
export function sommet(index: number, r: number): Point {
  const angle = -Math.PI / 2 + (index * Math.PI) / 3;
  // « || 0 » remplace -0 par 0 (sortie SVG plus lisible).
  const arrondi = (v: number) => Math.round(v * 100) / 100 || 0;
  return { x: arrondi(r * Math.cos(angle)), y: arrondi(r * Math.sin(angle)) };
}

/** Points du polygone de profil : chaque score est ramené entre 0 et `rayon` selon `max`. */
export function pointsProfil(
  scores: Record<RiasecId, number>,
  max: number,
  rayon: number,
): Point[] {
  if (!(max > 0)) throw new RangeError('Le maximum doit être positif');
  return RIASEC.map((l, i) => {
    const part = Math.min(Math.max(scores[l] / max, 0), 1);
    return sommet(i, part * rayon);
  });
}

export const versAttribut = (points: Point[]): string =>
  points.map((p) => `${p.x},${p.y}`).join(' ');

/** Position d'un score moyen (min à max) en pourcentage de la largeur d'une barre. */
export function pourcentageBarre(valeur: number, min: number, max: number): number {
  if (!(max > min)) throw new RangeError('Bornes invalides');
  return Math.round(Math.min(Math.max((valeur - min) / (max - min), 0), 1) * 1000) / 10;
}
