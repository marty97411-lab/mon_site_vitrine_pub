import { describe, expect, it } from 'vitest';
import { coterItem, estReponseValide } from './cotation';

const ipip = { min: 1, max: 5 };
const onet = { min: 0, max: 4 };

describe('coterItem', () => {
  it('laisse inchangée la réponse à un item direct', () => {
    for (const v of [1, 2, 3, 4, 5]) expect(coterItem(v, 'plus', ipip)).toBe(v);
    for (const v of [0, 1, 2, 3, 4]) expect(coterItem(v, 'plus', onet)).toBe(v);
  });

  it('inverse la réponse à un item à clé négative (échelle 1–5)', () => {
    expect([1, 2, 3, 4, 5].map((v) => coterItem(v, 'moins', ipip))).toEqual([5, 4, 3, 2, 1]);
  });

  it("inverse selon les bornes de l'échelle (0–4)", () => {
    expect([0, 1, 2, 3, 4].map((v) => coterItem(v, 'moins', onet))).toEqual([4, 3, 2, 1, 0]);
  });

  it.each([0, 6, 2.5, Number.NaN, -1])('refuse la valeur %s sur une échelle 1–5', (v) => {
    expect(() => coterItem(v, 'plus', ipip)).toThrow(RangeError);
  });
});

describe('estReponseValide', () => {
  it("dépend des bornes de l'échelle", () => {
    expect(estReponseValide(0, onet)).toBe(true);
    expect(estReponseValide(0, ipip)).toBe(false);
    expect(estReponseValide('3', ipip)).toBe(false);
  });
});
