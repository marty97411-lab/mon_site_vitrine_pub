import { describe, expect, it } from 'vitest';
import { referencesManquantes, verifierReferences } from './integrite';

const connues = new Set(['ipip', 'johnson-2014']);

describe('verifierReferences', () => {
  it('accepte des références existantes', () => {
    expect(() =>
      verifierReferences(connues, [{ origine: 'test', idSource: 'ipip' }]),
    ).not.toThrow();
  });

  it('signale chaque référence inconnue avec son origine', () => {
    const refs = [
      { origine: 'a', idSource: 'ipip' },
      { origine: 'metiers/x', idSource: 'inconnue' },
    ];
    expect(referencesManquantes(connues, refs)).toEqual([refs[1]]);
    expect(() => verifierReferences(connues, refs)).toThrow(/inconnue.*metiers\/x/);
  });
});
