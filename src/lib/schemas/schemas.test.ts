import { describe, expect, it } from 'vitest';
import { affirmationSchema, itemSchema, metierSchema, normesSchema } from './index';

describe('affirmationSchema', () => {
  it('refuse une affirmation sans source ni TODO', () => {
    expect(affirmationSchema.safeParse({ texte: 'Affirmation' }).success).toBe(false);
  });
  it('accepte une affirmation sourcée ou marquée TODO', () => {
    expect(affirmationSchema.safeParse({ texte: 'A', sources: ['ipip'] }).success).toBe(true);
    expect(affirmationSchema.safeParse({ texte: 'A', todo_source: true }).success).toBe(true);
  });
});

const itemValide = {
  id: 'C2-01',
  texte_fr: "J'aime ranger.",
  texte_original: 'Like to tidy up.',
  trait: 'C',
  facette: 'C2',
  cle: 'plus',
  instrument: 'IPIP-NEO-120',
  source: 'johnson-2014',
  licence: 'domaine-public',
  traduction: { statut: 'non-validee' },
};

describe('itemSchema', () => {
  it('accepte un item valide', () => {
    expect(itemSchema.safeParse(itemValide).success).toBe(true);
  });
  it('refuse une facette qui ne correspond pas au trait', () => {
    expect(itemSchema.safeParse({ ...itemValide, trait: 'E' }).success).toBe(false);
  });
  it('refuse une traduction « validee » sans source', () => {
    expect(itemSchema.safeParse({ ...itemValide, traduction: { statut: 'validee' } }).success).toBe(
      false,
    );
  });
  it('refuse une licence autre que le domaine public', () => {
    expect(itemSchema.safeParse({ ...itemValide, licence: 'propriétaire' }).success).toBe(false);
  });
});

const justification = { texte: 'J', todo_source: true };
const metierValide = {
  intitule: 'Exemple',
  codes: { onet: '29-1141.00' },
  riasec: { code: 'SCI', source: 'onet-online' },
  traits_pertinents: [{ trait: 'A', facettes: ['A3'], sens: 'eleve', justification }],
  points_forts: [justification],
  points_vigilance: [justification],
  sources: ['onet-online'],
  statut: 'exemple',
};

describe('metierSchema', () => {
  it('accepte un métier valide', () => {
    expect(metierSchema.safeParse(metierValide).success).toBe(true);
  });
  it('exige au moins un code O*NET ou ROME', () => {
    expect(metierSchema.safeParse({ ...metierValide, codes: {} }).success).toBe(false);
  });
  it('refuse un code O*NET mal formé', () => {
    expect(metierSchema.safeParse({ ...metierValide, codes: { onet: '291141' } }).success).toBe(
      false,
    );
  });
  it('refuse une facette étrangère au trait', () => {
    const traits = [{ trait: 'A', facettes: ['C2'], sens: 'eleve', justification }];
    expect(metierSchema.safeParse({ ...metierValide, traits_pertinents: traits }).success).toBe(
      false,
    );
  });
});

describe('normesSchema', () => {
  const vide = { moyenne: null, ecart_type: null };
  const base = {
    instrument: 'IPIP-NEO-120',
    statut: 'todo',
    source: null,
    population: null,
    echelle: { min: 1, max: 5 },
    traits: { O: vide, C: vide, E: vide, A: vide, N: vide },
    facettes: {},
  };
  it('accepte des normes vides en TODO', () => {
    expect(normesSchema.safeParse(base).success).toBe(true);
  });
  it('refuse des normes « verifie » sans source', () => {
    expect(normesSchema.safeParse({ ...base, statut: 'verifie' }).success).toBe(false);
  });
  it('refuse une moyenne sans écart-type', () => {
    const traits = { ...base.traits, O: { moyenne: 3, ecart_type: null } };
    expect(normesSchema.safeParse({ ...base, traits }).success).toBe(false);
  });
});
