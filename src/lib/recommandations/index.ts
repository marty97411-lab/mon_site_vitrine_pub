/**
 * Moteur de suggestions de lecture (fonctions pures). Les règles viennent de
 * src/data/recommandations.json ; elles sont appliquées dans l'ordre, sans pondération cachée.
 */
import { RIASEC, type RiasecId, type TraitId } from '../big-five';
import type { Condition, ConfigRecommandations } from '../schemas/recommandations';

export interface ProfilPourSuggestions {
  /** Scores moyens des traits (1 à 5) ; null ou absent si non calculé. */
  traits: Partial<Record<TraitId, number | null>>;
  /** Scores RIASEC (sommes) et maximum théorique d'une dimension ; null si absent. */
  riasec: Record<RiasecId, number> | null;
  riasecMax: number;
}

export interface Suggestion {
  id: string;
  /** Raisons des règles qui ont proposé cette suggestion (dans l'ordre). */
  raisons: string[];
  regles: string[];
}

export interface Suggestions {
  articles: Suggestion[];
  livres: Suggestion[];
}

export function conditionRemplie(condition: Condition, profil: ProfilPourSuggestions): boolean {
  switch (condition.type) {
    case 'toujours':
      return true;
    case 'trait': {
      const v = profil.traits[condition.trait];
      if (v === null || v === undefined) return false;
      if (condition.min !== undefined && v < condition.min) return false;
      if (condition.max !== undefined && v > condition.max) return false;
      return true;
    }
    case 'riasec-dominant': {
      if (!profil.riasec) return false;
      const scores = profil.riasec;
      const max = Math.max(...RIASEC.map((l) => scores[l]));
      return condition.lettres.some((l) => scores[l] === max);
    }
    case 'riasec-peu-differencie': {
      if (!profil.riasec || !(profil.riasecMax > 0)) return false;
      const scores = profil.riasec;
      const valeurs = RIASEC.map((l) => scores[l]);
      return (
        (Math.max(...valeurs) - Math.min(...valeurs)) / profil.riasecMax <= condition.ecart_max
      );
    }
  }
}

function ajouter(liste: Suggestion[], id: string, raison: string, regle: string) {
  const existante = liste.find((s) => s.id === id);
  if (existante) {
    if (!existante.raisons.includes(raison)) existante.raisons.push(raison);
    existante.regles.push(regle);
  } else {
    liste.push({ id, raisons: [raison], regles: [regle] });
  }
}

/**
 * Applique les règles dans l'ordre. Les règles « toujours » ne servent qu'à compléter
 * jusqu'au minimum ; le résultat est tronqué au maximum.
 */
export function suggerer(
  config: ConfigRecommandations,
  profil: ProfilPourSuggestions,
): Suggestions {
  const articles: Suggestion[] = [];
  const livres: Suggestion[] = [];
  const specifiques = config.regles.filter((r) => r.si.type !== 'toujours');
  const parDefaut = config.regles.filter((r) => r.si.type === 'toujours');

  for (const regle of specifiques) {
    if (!conditionRemplie(regle.si, profil)) continue;
    for (const id of regle.articles) ajouter(articles, id, regle.raison, regle.id);
    for (const id of regle.livres) ajouter(livres, id, regle.raison, regle.id);
  }
  for (const regle of parDefaut) {
    for (const id of regle.articles) {
      if (articles.length < config.minimum) ajouter(articles, id, regle.raison, regle.id);
    }
    for (const id of regle.livres) {
      if (livres.length < config.minimum) ajouter(livres, id, regle.raison, regle.id);
    }
  }
  return { articles: articles.slice(0, config.maximum), livres: livres.slice(0, config.maximum) };
}

const NOMS_TRAITS: Record<TraitId, string> = {
  O: 'Ouverture',
  C: 'Conscienciosité',
  E: 'Extraversion',
  A: 'Agréabilité',
  N: 'Névrosisme',
};
const NOMS_RIASEC: Record<RiasecId, string> = {
  R: 'Réaliste',
  I: 'Investigateur',
  A: 'Artistique',
  S: 'Social',
  E: 'Entreprenant',
  C: 'Conventionnel',
};
const virgule = (n: number) => n.toLocaleString('fr-FR');

/** Description lisible d'une condition, pour la page qui explique les règles. */
export function decrireCondition(condition: Condition): string {
  switch (condition.type) {
    case 'toujours':
      return 'Tous les profils (complète les suggestions si besoin)';
    case 'trait': {
      const bornes = [
        condition.min !== undefined ? `au moins ${virgule(condition.min)}` : '',
        condition.max !== undefined ? `au plus ${virgule(condition.max)}` : '',
      ].filter(Boolean);
      return `${NOMS_TRAITS[condition.trait]} : score moyen ${bornes.join(' et ')} sur 5`;
    }
    case 'riasec-dominant':
      return `Intérêt dominant : ${condition.lettres.map((l) => NOMS_RIASEC[l]).join(' ou ')}`;
    case 'riasec-peu-differencie':
      return `Intérêts peu différenciés : écart entre le plus haut et le plus bas des six scores inférieur ou égal à ${Math.round(condition.ecart_max * 100)} % du score maximal`;
  }
}
