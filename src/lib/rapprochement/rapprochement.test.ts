import { describe, expect, it } from 'vitest';
import {
  correlation,
  niveauCorrespondance,
  rapprocher,
  regrouperParFamille,
  SEUIL_FORTE,
  SEUIL_TRES_FORTE,
} from './index';

describe('correlation', () => {
  it('vaut 1 pour des profils de même forme, quel que soit leur niveau', () => {
    expect(correlation([1, 2, 3, 4, 5, 6], [10, 20, 30, 40, 50, 60])).toBeCloseTo(1, 12);
  });
  it('vaut -1 pour des profils de forme opposée', () => {
    expect(correlation([1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1])).toBeCloseTo(-1, 12);
  });
  it('reproduit une valeur calculée à la main', () => {
    // x = (1,2,3), y = (1,3,2) : sxy = 1, sxx = syy = 2 → r = 0,5
    expect(correlation([1, 2, 3], [1, 3, 2])).toBeCloseTo(0.5, 12);
  });
  it('renvoie null si un profil est plat', () => {
    expect(correlation([3, 3, 3], [1, 2, 3])).toBeNull();
  });
  it('refuse des profils de longueurs différentes', () => {
    expect(() => correlation([1, 2], [1, 2, 3])).toThrow(RangeError);
  });
});

describe('niveauCorrespondance (seuils du manuel O*NET)', () => {
  it('applique les seuils 0,729 et 0,608', () => {
    expect(SEUIL_TRES_FORTE).toBe(0.729);
    expect(SEUIL_FORTE).toBe(0.608);
    expect(niveauCorrespondance(0.729)).toBe('tres-forte');
    expect(niveauCorrespondance(0.7289)).toBe('forte');
    expect(niveauCorrespondance(0.608)).toBe('forte');
    expect(niveauCorrespondance(0.6079)).toBe('moderee');
    expect(niveauCorrespondance(0)).toBe('moderee');
    expect(niveauCorrespondance(-0.01)).toBeNull();
  });
});

// Métiers fictifs, réservés aux tests.
const metiers = [
  { code: '01-0001.00', famille: '01', riasec: { R: 1, I: 2, A: 1, S: 6, E: 2, C: 3 } },
  { code: '01-0002.00', famille: '01', riasec: { R: 1, I: 3, A: 1, S: 5, E: 2, C: 4 } },
  { code: '02-0001.00', famille: '02', riasec: { R: 6, I: 3, A: 1, S: 1, E: 2, C: 4 } },
  { code: '03-0001.00', famille: '03', riasec: { R: 2, I: 6, A: 2, S: 4, E: 1, C: 3 } },
];
const personne = { R: 2, I: 6, A: 2, S: 18, E: 5, C: 9 };

describe('rapprocher', () => {
  it('classe par corrélation décroissante et écarte les corrélations négatives', () => {
    const resultat = rapprocher(personne, metiers);
    if (resultat.statut !== 'ok') throw new Error('statut inattendu');
    const codes = resultat.correspondances.map((c) => c.metier.code);
    expect(codes[0]).toBe('01-0001.00');
    expect(codes).not.toContain('02-0001.00');
    const rs = resultat.correspondances.map((c) => c.r);
    expect([...rs].sort((a, b) => b - a)).toEqual(rs);
  });

  it('signale un profil plat (ex. « strongly dislike » partout)', () => {
    expect(rapprocher({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, metiers).statut).toBe('profil-plat');
  });
});

describe('regrouperParFamille', () => {
  it('regroupe par famille, triée selon le meilleur métier, avec un plafond par famille', () => {
    const resultat = rapprocher(personne, metiers);
    if (resultat.statut !== 'ok') throw new Error('statut inattendu');
    const familles = regrouperParFamille(resultat.correspondances, 1);
    expect(familles.map((f) => f.famille)).toEqual(['01', '03']);
    expect(familles[0]?.metiers).toHaveLength(1);
  });
});
