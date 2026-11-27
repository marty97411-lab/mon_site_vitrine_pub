/**
 * Vérifie que les fichiers de données respectent leurs schémas et que
 * toutes les références à des sources existent.
 */
import { describe, expect, it } from 'vitest';
import items from '../../data/items/items.json';
import normes from '../../data/normes/normes.json';
import sources from '../../content/sources/sources.json';
import { itemSchema, normesSchema, sourceSchema } from './index';

const idsSources = new Set(sources.map((s) => s.id));

describe('sources.json', () => {
  it('respecte le schéma', () => {
    for (const s of sources) expect(() => sourceSchema.parse(s), s.id).not.toThrow();
  });
  it("n'a pas d'identifiant en double", () => {
    expect(idsSources.size).toBe(sources.length);
  });
});

describe('items.json', () => {
  it('respecte le schéma', () => {
    for (const i of items) expect(() => itemSchema.parse(i), i.id).not.toThrow();
  });
  it("n'a pas d'identifiant en double", () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });
  it('ne cite que des sources existantes', () => {
    for (const i of items) expect(idsSources.has(i.source), i.id).toBe(true);
  });
});

describe('normes.json', () => {
  it('respecte le schéma', () => {
    expect(() => normesSchema.parse(normes)).not.toThrow();
  });
  it('cite une source existante si des normes sont renseignées', () => {
    const n = normesSchema.parse(normes);
    if (n.source !== null) expect(idsSources.has(n.source)).toBe(true);
  });
});
