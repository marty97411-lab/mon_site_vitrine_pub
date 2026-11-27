import { describe, expect, it } from 'vitest';
import { codeRiasec, profilRiasec } from './riasec';

describe('codeRiasec', () => {
  it('renvoie les trois dimensions les plus élevées dans l’ordre', () => {
    expect(codeRiasec({ R: 5, I: 12, A: 3, S: 18, E: 7, C: 15 })).toEqual({
      code: 'SCI',
      egalite: false,
    });
  });

  it('signale une égalité dans le code et départage selon l’ordre RIASEC', () => {
    expect(codeRiasec({ R: 10, I: 10, A: 2, S: 3, E: 4, C: 1 })).toEqual({
      code: 'RIE',
      egalite: true,
    });
  });

  it('signale une égalité entre la 3e et la 4e dimension', () => {
    expect(codeRiasec({ R: 20, I: 15, A: 8, S: 8, E: 1, C: 0 }).egalite).toBe(true);
  });
});

describe('profilRiasec', () => {
  const score = (valeur: number | null) => ({ valeur, nbRepondus: 5, nbItems: 5, min: 0, max: 20 });
  it('renvoie null si une dimension manque', () => {
    expect(profilRiasec({ domaines: { R: score(3) }, facettes: {} })).toBeNull();
  });
  it('extrait les six scores', () => {
    const domaines = Object.fromEntries(
      ['R', 'I', 'A', 'S', 'E', 'C'].map((l, i) => [l, score(i)]),
    );
    expect(profilRiasec({ domaines, facettes: {} })).toEqual({
      R: 0,
      I: 1,
      A: 2,
      S: 3,
      E: 4,
      C: 5,
    });
  });
});
