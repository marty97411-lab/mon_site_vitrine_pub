import { describe, expect, it } from 'vitest';
import { erf, repartitionNormale, versPercentile } from './percentiles';

// Normes FICTIVES, réservées aux tests : elles ne doivent jamais être utilisées sur le site.
const normeFictive = { moyenne: 3, ecart_type: 0.5 };

describe('repartitionNormale', () => {
  it('vaut 0,5 en 0 et est symétrique', () => {
    expect(repartitionNormale(0)).toBeCloseTo(0.5, 7);
    expect(repartitionNormale(1.3) + repartitionNormale(-1.3)).toBeCloseTo(1, 7);
  });

  it('reproduit des valeurs connues de la loi normale', () => {
    // Φ(1) ≈ 0,841345 ; Φ(1,96) ≈ 0,975002 ; Φ(-2) ≈ 0,022750
    expect(repartitionNormale(1)).toBeCloseTo(0.841345, 5);
    expect(repartitionNormale(1.96)).toBeCloseTo(0.975002, 5);
    expect(repartitionNormale(-2)).toBeCloseTo(0.02275, 5);
  });

  it('erf est impaire', () => {
    expect(erf(-0.7)).toBeCloseTo(-erf(0.7), 10);
  });
});

describe('versPercentile', () => {
  it('place la moyenne au 50e percentile', () => {
    expect(versPercentile(3, normeFictive)).toBeCloseTo(50, 5);
  });

  it('place un écart-type au-dessus vers le 84e percentile', () => {
    expect(versPercentile(3.5, normeFictive)).toBeCloseTo(84.13, 1);
  });

  it('reste entre 0 et 100 pour les scores extrêmes', () => {
    const haut = versPercentile(5, normeFictive);
    const bas = versPercentile(1, normeFictive);
    expect(haut).not.toBeNull();
    expect(bas).not.toBeNull();
    expect(haut ?? -1).toBeLessThanOrEqual(100);
    expect(bas ?? -1).toBeGreaterThanOrEqual(0);
  });

  it('renvoie null si la norme est absente ou non sourcée', () => {
    expect(versPercentile(3, undefined)).toBeNull();
    expect(versPercentile(3, { moyenne: null, ecart_type: null })).toBeNull();
    expect(versPercentile(3, { moyenne: 3, ecart_type: 0 })).toBeNull();
  });

  it('renvoie null si le score est absent', () => {
    expect(versPercentile(null, normeFictive)).toBeNull();
  });
});
