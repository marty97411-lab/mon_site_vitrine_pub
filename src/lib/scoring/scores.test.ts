import { describe, expect, it } from 'vitest';
import { calculerProfil } from './scores';
import type { ItemCotation } from './types';

// Items fictifs, réservés aux tests.
const items: ItemCotation[] = [
  { id: 'C2-01', trait: 'C', facette: 'C2', cle: 'plus' },
  { id: 'C2-02', trait: 'C', facette: 'C2', cle: 'moins' },
  { id: 'C5-01', trait: 'C', facette: 'C5', cle: 'plus' },
  { id: 'C5-02', trait: 'C', facette: 'C5', cle: 'plus' },
  { id: 'E2-01', trait: 'E', facette: 'E2', cle: 'plus' },
  { id: 'E2-02', trait: 'E', facette: 'E2', cle: 'moins' },
];

describe('calculerProfil', () => {
  it('calcule les moyennes par facette et par trait en inversant les items négatifs', () => {
    const profil = calculerProfil(items, {
      'C2-01': 5,
      'C2-02': 1, // inversé → 5
      'C5-01': 2,
      'C5-02': 4,
      'E2-01': 4,
      'E2-02': 4, // inversé → 2
    });
    expect(profil.facettes.C2).toEqual({ moyenne: 5, nbRepondus: 2, nbItems: 2 });
    expect(profil.facettes.C5).toEqual({ moyenne: 3, nbRepondus: 2, nbItems: 2 });
    expect(profil.traits.C).toEqual({ moyenne: 4, nbRepondus: 4, nbItems: 4 });
    expect(profil.traits.E?.moyenne).toBe(3);
  });

  it("n'inclut que les traits et facettes présents dans les items", () => {
    const profil = calculerProfil(items, {});
    expect(Object.keys(profil.traits).sort()).toEqual(['C', 'E']);
    expect(profil.traits.O).toBeUndefined();
  });

  it('renvoie null sans aucune réponse', () => {
    const profil = calculerProfil(items, {});
    expect(profil.traits.C).toEqual({ moyenne: null, nbRepondus: 0, nbItems: 4 });
  });

  it('calcule le score sur les items répondus si le seuil de complétude est atteint', () => {
    const profil = calculerProfil(items, { 'C2-01': 4 });
    // Facette C2 : 1 item sur 2 = 50 % → calculée ; trait C : 1 sur 4 = 25 % → null.
    expect(profil.facettes.C2?.moyenne).toBe(4);
    expect(profil.traits.C?.moyenne).toBeNull();
  });

  it('respecte un seuil de complétude personnalisé', () => {
    const profil = calculerProfil(items, { 'C2-01': 4 }, { seuilCompletude: 1 });
    expect(profil.facettes.C2?.moyenne).toBeNull();
  });

  it('refuse un seuil invalide', () => {
    expect(() => calculerProfil(items, {}, { seuilCompletude: 0 })).toThrow(RangeError);
    expect(() => calculerProfil(items, {}, { seuilCompletude: 1.5 })).toThrow(RangeError);
  });

  it('refuse une réponse hors échelle', () => {
    expect(() => calculerProfil(items, { 'C2-01': 7 })).toThrow(/C2-01/);
  });

  it('refuse les items en double', () => {
    const premier = items[0];
    if (!premier) throw new Error('jeu de test vide');
    expect(() => calculerProfil([...items, premier], {})).toThrow(/double/);
  });

  it('ignore les réponses à des items inconnus', () => {
    const profil = calculerProfil(items, { 'X9-99': 5, 'E2-01': 5, 'E2-02': 1 });
    expect(profil.traits.E?.moyenne).toBe(5);
  });

  it('borne les scores entre 1 et 5', () => {
    const tousA5 = Object.fromEntries(items.map((i) => [i.id, i.cle === 'plus' ? 5 : 1]));
    const tousA1 = Object.fromEntries(items.map((i) => [i.id, i.cle === 'plus' ? 1 : 5]));
    expect(calculerProfil(items, tousA5).traits.C?.moyenne).toBe(5);
    expect(calculerProfil(items, tousA1).traits.C?.moyenne).toBe(1);
  });
});
