import { describe, expect, it } from 'vitest';
import { pointsProfil, pourcentageBarre, sommet, versAttribut } from './visualisation';

describe('hexagone RIASEC', () => {
  it('place R en haut et S en bas', () => {
    expect(sommet(0, 100)).toEqual({ x: 0, y: -100 });
    expect(sommet(3, 100)).toEqual({ x: 0, y: 100 });
  });
  it('ramène chaque score sur le rayon selon le maximum', () => {
    const pts = pointsProfil({ R: 0, I: 10, A: 20, S: 20, E: 5, C: 40 }, 40, 100);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[3]).toEqual({ x: 0, y: 50 });
    expect(Math.hypot(pts[5]?.x ?? 0, pts[5]?.y ?? 0)).toBeCloseTo(100, 1);
  });
  it('borne les valeurs hors échelle et refuse un maximum nul', () => {
    const pts = pointsProfil({ R: 99, I: -1, A: 0, S: 0, E: 0, C: 0 }, 20, 10);
    expect(pts[0]).toEqual({ x: 0, y: -10 });
    expect(pts[1]).toEqual({ x: 0, y: 0 });
    expect(() => pointsProfil({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, 0, 10)).toThrow(RangeError);
  });
  it('sérialise les points pour un attribut SVG', () => {
    expect(
      versAttribut([
        { x: 1, y: 2 },
        { x: -3, y: 4.5 },
      ]),
    ).toBe('1,2 -3,4.5');
  });
});

describe('pourcentageBarre', () => {
  it('convertit un score de 1 à 5 en largeur', () => {
    expect(pourcentageBarre(1, 1, 5)).toBe(0);
    expect(pourcentageBarre(3, 1, 5)).toBe(50);
    expect(pourcentageBarre(4.2, 1, 5)).toBe(80);
    expect(pourcentageBarre(9, 1, 5)).toBe(100);
  });
});
