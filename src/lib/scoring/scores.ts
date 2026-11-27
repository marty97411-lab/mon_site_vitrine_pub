import { coterItem, estReponseValide } from './cotation';
import type { ConfigCotation, ItemCotation, Profil, Reponses, ScoreEchelle } from './types';

function scoreEchelle(
  items: readonly ItemCotation[],
  reponses: Reponses,
  config: ConfigCotation,
): ScoreEchelle {
  const { echelle, agregation, seuil_completude } = config;
  const valeurs: number[] = [];
  for (const item of items) {
    const brute = reponses[item.id];
    if (brute === undefined) continue;
    if (!estReponseValide(brute, echelle)) {
      throw new RangeError(`Réponse invalide pour l'item ${item.id} : ${String(brute)}`);
    }
    valeurs.push(coterItem(brute, item.cle, echelle));
  }
  const nbItems = items.length;
  const nbRepondus = valeurs.length;
  const somme = valeurs.reduce((a, b) => a + b, 0);
  const complet = nbItems > 0 && nbRepondus > 0 && nbRepondus / nbItems >= seuil_completude;
  if (agregation === 'somme') {
    return {
      valeur: complet ? somme : null,
      nbRepondus,
      nbItems,
      min: echelle.min * nbItems,
      max: echelle.max * nbItems,
    };
  }
  return {
    valeur: complet ? somme / nbRepondus : null,
    nbRepondus,
    nbItems,
    min: echelle.min,
    max: echelle.max,
  };
}

function grouper(
  items: readonly ItemCotation[],
  cle: (i: ItemCotation) => string | undefined,
): Map<string, ItemCotation[]> {
  const groupes = new Map<string, ItemCotation[]>();
  for (const item of items) {
    const k = cle(item);
    if (k === undefined) continue;
    const groupe = groupes.get(k);
    if (groupe) groupe.push(item);
    else groupes.set(k, [item]);
  }
  return groupes;
}

/**
 * Calcule les scores par domaine (trait ou dimension RIASEC) et par facette.
 * - « moyenne » (IPIP) : moyenne des items répondus, si le seuil de complétude est atteint ;
 * - « somme » (O*NET) : somme des items, qui exige toutes les réponses (seuil 1).
 * Le score d'un trait est la moyenne de tous ses items (égale à la moyenne des facettes
 * lorsque toutes sont complètes et de même taille).
 */
export function calculerProfil(config: ConfigCotation, reponses: Reponses): Profil {
  const { seuil_completude, agregation } = config;
  if (!(seuil_completude > 0 && seuil_completude <= 1)) {
    throw new RangeError('Le seuil de complétude doit être compris entre 0 (exclu) et 1');
  }
  if (agregation === 'somme' && seuil_completude !== 1) {
    throw new RangeError('Un score en somme exige toutes les réponses (seuil 1)');
  }
  const ids = new Set<string>();
  for (const item of config.items) {
    if (ids.has(item.id)) throw new Error(`Item en double : ${item.id}`);
    ids.add(item.id);
  }

  const profil: Profil = { domaines: {}, facettes: {} };
  for (const [facette, groupe] of grouper(config.items, (i) => i.facette)) {
    profil.facettes[facette] = scoreEchelle(groupe, reponses, config);
  }
  for (const [domaine, groupe] of grouper(config.items, (i) => i.domaine)) {
    profil.domaines[domaine] = scoreEchelle(groupe, reponses, config);
  }
  return profil;
}

/** Nombre d'items du questionnaire ayant une réponse valide. */
export function compterReponses(config: ConfigCotation, reponses: Reponses): number {
  return config.items.filter((i) => estReponseValide(reponses[i.id], config.echelle)).length;
}
