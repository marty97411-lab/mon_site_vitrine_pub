import { describe, expect, it } from 'vitest';
import { coterItem, estReponseValide } from './cotation';

describe('coterItem', () => {
  it('laisse inchangée la réponse à un item direct', () => {
    for (const v of [1, 2, 3, 4, 5]) expect(coterItem(v, 'plus')).toBe(v);
  });

  it('inverse la réponse à un item à clé négative', () => {
    expect([1, 2, 3, 4, 5].map((v) => coterItem(v, 'moins'))).toEqual([5, 4, 3, 2, 1]);
  });

  it.each([0, 6, 2.5, Number.NaN, -1])('refuse la valeur hors échelle %s', (v) => {
    expect(() => coterItem(v, 'plus')).toThrow(RangeError);
  });
});

describe('estReponseValide', () => {
  it('accepte uniquement les entiers de 1 à 5', () => {
    expect(estReponseValide(3)).toBe(true);
    expect(estReponseValide('3')).toBe(false);
    expect(estReponseValide(undefined)).toBe(false);
  });
});
