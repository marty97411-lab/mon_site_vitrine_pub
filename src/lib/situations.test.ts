import { describe, expect, it } from 'vitest';
import { dispositifSchema, ideeRecueSchema, situationSchema } from './schemas';
import { configSituations, dispositifs, minutes, verifierSituations } from './situations';

// Article fictif, pour les tests uniquement.
const article = situationSchema.parse({
  titre: 'Titre',
  description: 'Description',
  accroche: 'Accroche',
  moment: 'transition',
  ordre: 1,
  essentiel: 'Essentiel.',
  ressenti: { texte: 'Ressenti.' },
  recherche: { essentiel: 'E', comprendre: 'C', sources: ['savickas-2012'] },
  idees_recues: [1, 2, 3].map((n) => ({
    affirmation: `Idée ${n}`,
    verdict: 'nuance',
    explication: 'Explication',
    todo_source: true,
  })),
  questions: ['Q1 ?', 'Q2 ?', 'Q3 ?', 'Q4 ?', 'Q5 ?'],
  pistes: [1, 2, 3].map((n) => ({ titre: `Piste ${n}`, texte: 'Texte' })),
  dispositifs: ['cep'],
  philosophie: ['stoiciens'],
  livres: ['livre-a', 'livre-b'],
});

const ids = {
  dispositifs: new Set(['cep']),
  philosophie: new Set(['stoiciens']),
  livres: new Set(['livre-a', 'livre-b']),
};
const config = { question_resultats: { options: [{ valeur: 'x', article: 'a' }] } };

describe('situationSchema', () => {
  it('impose 3 à 5 idées reçues et 5 à 8 questions', () => {
    expect(situationSchema.safeParse({ ...article, idees_recues: [] }).success).toBe(false);
    expect(situationSchema.safeParse({ ...article, questions: ['Q ?'] }).success).toBe(false);
  });
  it('refuse une idée reçue sans source ni TODO', () => {
    expect(
      ideeRecueSchema.safeParse({ affirmation: 'A', verdict: 'faux', explication: 'E' }).success,
    ).toBe(false);
  });
});

describe('dispositifSchema', () => {
  const base = { id: 'test', nom: 'Test', description: 'D', pour_qui: 'P' };
  it('exige date et source pour un lien, et un TODO sans lien', () => {
    const lien = { url: 'https://exemple.fr/', libelle: 'Lien' };
    expect(
      dispositifSchema.safeParse({ ...base, lien, verifie_le: null, source: null }).success,
    ).toBe(false);
    expect(
      dispositifSchema.safeParse({ ...base, lien: null, verifie_le: null, source: null }).success,
    ).toBe(false);
    expect(
      dispositifSchema.safeParse({
        ...base,
        lien: null,
        verifie_le: null,
        source: null,
        todo: 'À vérifier',
      }).success,
    ).toBe(true);
  });
  it('les dispositifs du site respectent le schéma, avec un identifiant unique', () => {
    const tous = dispositifs.dispositifs.map((d) => d.id);
    expect(new Set(tous).size).toBe(tous.length);
    expect(configSituations.moments.map((m) => m.id)).toContain('transversal');
  });
});

describe('verifierSituations', () => {
  it('accepte des références existantes', () => {
    expect(() => verifierSituations([{ id: 'a', data: article }], ids, config)).not.toThrow();
  });
  it('signale un dispositif, une page, un livre ou un article inconnu', () => {
    const casse = {
      ...article,
      dispositifs: ['inconnu'],
      philosophie: ['absente'],
      livres: ['livre-a', 'livre-z'],
      articles_lies: ['a'],
    };
    expect(() => verifierSituations([{ id: 'a', data: casse }], ids, config)).toThrow(
      /dispositif inconnu[\s\S]*Philosophie inconnue[\s\S]*livre inconnu[\s\S]*article lié invalide/,
    );
    expect(() =>
      verifierSituations([{ id: 'a', data: article }], ids, {
        question_resultats: { options: [{ valeur: 'x', article: 'b' }] },
      }),
    ).toThrow(/article inconnu « b »/);
  });
});

describe('minutes', () => {
  it('compte au moins une minute', () => {
    expect(minutes(['un mot'])).toBe(1);
    expect(minutes(['mot '.repeat(600)])).toBe(3);
  });
});
