import type { FacetteId, TraitId } from '../big-five';
import { coterItem, estReponseValide } from './cotation';
import type { ItemCotation, Profil, Reponses, ScoreEchelle } from './types';

export interface OptionsScore {
  /**
   * Part minimale d'items répondus pour qu'un score soit calculé (0 à 1).
   * En dessous, le score vaut null plutôt qu'une estimation peu fiable.
   * Valeur par défaut : 0,5 (choix de conception, voir docs/methodologie-score.md).
   */
  seuilCompletude?: number;
}

const SEUIL_PAR_DEFAUT = 0.5;

function scoreEchelle(
  items: readonly ItemCotation[],
  reponses: Reponses,
  seuil: number,
): ScoreEchelle {
  const valeurs: number[] = [];
  for (const item of items) {
    const brute = reponses[item.id];
    if (brute === undefined) continue;
    if (!estReponseValide(brute)) {
      throw new RangeError(`Réponse invalide pour l'item ${item.id} : ${String(brute)}`);
    }
    valeurs.push(coterItem(brute, item.cle));
  }
  const nbItems = items.length;
  const nbRepondus = valeurs.length;
  const complet = nbItems > 0 && nbRepondus > 0 && nbRepondus / nbItems >= seuil;
  const moyenne = complet ? valeurs.reduce((a, b) => a + b, 0) / nbRepondus : null;
  return { moyenne, nbRepondus, nbItems };
}

function grouper<K extends string>(
  items: readonly ItemCotation[],
  cle: (i: ItemCotation) => K,
): Map<K, ItemCotation[]> {
  const groupes = new Map<K, ItemCotation[]>();
  for (const item of items) {
    const k = cle(item);
    const groupe = groupes.get(k);
    if (groupe) groupe.push(item);
    else groupes.set(k, [item]);
  }
  return groupes;
}

/**
 * Calcule les scores moyens par facette et par trait.
 * Le score d'un trait est la moyenne de tous ses items répondus
 * (équivalent à la moyenne des facettes lorsque toutes sont complètes et de même taille).
 */
export function calculerProfil(
  items: readonly ItemCotation[],
  reponses: Reponses,
  options: OptionsScore = {},
): Profil {
  const seuil = options.seuilCompletude ?? SEUIL_PAR_DEFAUT;
  if (!(seuil > 0 && seuil <= 1)) {
    throw new RangeError('Le seuil de complétude doit être compris entre 0 (exclu) et 1');
  }

  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Item en double : ${item.id}`);
    ids.add(item.id);
  }

  const profil: Profil = { traits: {}, facettes: {} };
  for (const [facette, groupe] of grouper<FacetteId>(items, (i) => i.facette)) {
    profil.facettes[facette] = scoreEchelle(groupe, reponses, seuil);
  }
  for (const [trait, groupe] of grouper<TraitId>(items, (i) => i.trait)) {
    profil.traits[trait] = scoreEchelle(groupe, reponses, seuil);
  }
  return profil;
}
