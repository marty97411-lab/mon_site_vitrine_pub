import { describe, expect, it } from 'vitest';
import { calculerProfil, compterReponses } from './scores';
import type { ConfigCotation } from './types';

// Configuration fictive, réservée aux tests.
const config: ConfigCotation = {
  echelle: { min: 1, max: 5 },
  agregation: 'moyenne',
  seuil_completude: 0.5,
  items: [
    { id: 'C2-01', domaine: 'C', facette: 'C2', cle: 'plus' },
    { id: 'C2-02', domaine: 'C', facette: 'C2', cle: 'moins' },
    { id: 'C5-01', domaine: 'C', facette: 'C5', cle: 'plus' },
    { id: 'C5-02', domaine: 'C', facette: 'C5', cle: 'plus' },
    { id: 'E2-01', domaine: 'E', facette: 'E2', cle: 'plus' },
    { id: 'E2-02', domaine: 'E', facette: 'E2', cle: 'moins' },
  ],
};

describe('calculerProfil (moyenne)', () => {
  it('calcule les moyennes par facette et par domaine en inversant les items négatifs', () => {
    const profil = calculerProfil(config, {
      'C2-01': 5,
      'C2-02': 1, // inversé → 5
      'C5-01': 2,
      'C5-02': 4,
      'E2-01': 4,
      'E2-02': 4, // inversé → 2
    });
    expect(profil.facettes['C2']).toEqual({ valeur: 5, nbRepondus: 2, nbItems: 2, min: 1, max: 5 });
    expect(profil.facettes['C5']?.valeur).toBe(3);
    expect(profil.domaines['C']?.valeur).toBe(4);
    expect(profil.domaines['E']?.valeur).toBe(3);
  });

  it('renvoie null sous le seuil de complétude', () => {
    const profil = calculerProfil(config, { 'C2-01': 4 });
    expect(profil.facettes['C2']?.valeur).toBe(4); // 1/2 = 50 %
    expect(profil.domaines['C']?.valeur).toBeNull(); // 1/4 = 25 %
  });

  it('refuse un seuil invalide et une réponse hors échelle', () => {
    expect(() => calculerProfil({ ...config, seuil_completude: 0 }, {})).toThrow(RangeError);
    expect(() => calculerProfil(config, { 'C2-01': 7 })).toThrow(/C2-01/);
  });

  it('refuse les items en double', () => {
    const items = [...config.items, { id: 'C2-01', domaine: 'C', cle: 'plus' as const }];
    expect(() => calculerProfil({ ...config, items }, {})).toThrow(/double/);
  });

  it('ignore les réponses à des items inconnus', () => {
    const profil = calculerProfil(config, { 'IP-R01': 4, 'E2-01': 5, 'E2-02': 1 });
    expect(profil.domaines['E']?.valeur).toBe(5);
  });
});

describe('calculerProfil (somme)', () => {
  const somme: ConfigCotation = {
    echelle: { min: 0, max: 4 },
    agregation: 'somme',
    seuil_completude: 1,
    items: [
      { id: 'IP-R01', domaine: 'R', cle: 'plus' },
      { id: 'IP-R02', domaine: 'R', cle: 'plus' },
    ],
  };

  it('additionne les réponses et indique les bornes du score', () => {
    expect(calculerProfil(somme, { 'IP-R01': 3, 'IP-R02': 4 }).domaines['R']).toEqual({
      valeur: 7,
      nbRepondus: 2,
      nbItems: 2,
      min: 0,
      max: 8,
    });
  });

  it('exige toutes les réponses : pas de somme partielle', () => {
    expect(calculerProfil(somme, { 'IP-R01': 3 }).domaines['R']?.valeur).toBeNull();
  });

  it('refuse un seuil inférieur à 1', () => {
    expect(() => calculerProfil({ ...somme, seuil_completude: 0.5 }, {})).toThrow(RangeError);
  });
});

describe('compterReponses', () => {
  it('ne compte que les réponses valides aux items du questionnaire', () => {
    expect(compterReponses(config, { 'C2-01': 3, 'C2-02': 9, 'X-01': 3 })).toBe(1);
  });
});
