import { describe, expect, it } from 'vitest';
import donnees from '../data/glossaire.json';
import { glossaireSchema } from './schemas';
import { definition, GLOSSAIRE, lienGlossaire, type TermeGlossaire } from './glossaire';

const TERMES: TermeGlossaire[] = [
  'big-five',
  'riasec',
  'trait',
  'facette',
  'ipip',
  'percentile',
  'onet',
  'job-zone',
  'correlation',
  'meta-analyse',
  'introversion-extraversion',
  'ambiversion',
];

describe('glossaire', () => {
  it('respecte le schéma, sans doublon', () => {
    const g = glossaireSchema.parse(donnees);
    expect(new Set(g.map((e) => e.id)).size).toBe(g.length);
  });
  it('définit chaque terme utilisable dans le code', () => {
    for (const t of TERMES) {
      expect(definition(t).court.length, t).toBeGreaterThan(10);
      expect(GLOSSAIRE[t]).toBe(definition(t).court);
    }
  });
  it('produit des ancres vers la page Glossaire', () => {
    expect(lienGlossaire('riasec')).toBe('/glossaire#riasec');
  });
});
