import { describe, expect, it } from 'vitest';
import { NIVEAUX_CERTIFICATION as NIVEAUX_SCRIPT } from '../../scripts/lib/correspondance-fr.mjs';
import { NIVEAUX_CERTIFICATION, dateFr } from './metiers-fr';

describe('metiers-fr', () => {
  it('les libellés de niveau du site et du script d’import sont identiques', () => {
    expect(NIVEAUX_CERTIFICATION).toEqual(NIVEAUX_SCRIPT);
  });
  it('met une date ISO au format français', () => {
    expect(dateFr('2026-10-05T00:00:00+02:00')).toBe('05/10/2026');
    expect(dateFr('19/10/2026')).toBe('19/10/2026');
  });
});
