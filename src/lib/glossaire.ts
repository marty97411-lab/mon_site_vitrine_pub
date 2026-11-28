/**
 * Accès au glossaire (src/data/glossaire.json), source unique des explications de termes
 * techniques : composant Terme (pages), page /glossaire, textes générés côté client.
 */
import donnees from '../data/glossaire.json';

export type TermeGlossaire =
  | 'big-five'
  | 'riasec'
  | 'trait'
  | 'facette'
  | 'ipip'
  | 'percentile'
  | 'onet'
  | 'job-zone'
  | 'correlation'
  | 'meta-analyse'
  | 'introversion-extraversion'
  | 'ambiversion';

export interface Definition {
  id: TermeGlossaire;
  terme: string;
  court: string;
  definition: string;
  voir?: string;
}

const ENTREES = donnees as Definition[];

export function definition(id: TermeGlossaire): Definition {
  const d = ENTREES.find((e) => e.id === id);
  if (!d) throw new Error(`Terme absent du glossaire : ${id}`);
  return d;
}

/** Explications courtes, indexées par terme (compatibilité avec les textes côté client). */
export const GLOSSAIRE = Object.fromEntries(ENTREES.map((e) => [e.id, e.court])) as Record<
  TermeGlossaire,
  string
>;

export const lienGlossaire = (id: TermeGlossaire) => `/glossaire#${id}`;
