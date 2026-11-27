/** Vérifie que les paires de couleurs utilisées respectent WCAG AA (4,5:1 pour le texte). */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contraste, lireCouleurs } from './contraste';

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
const debutSombre = css.indexOf('@media (prefers-color-scheme: dark)');
const clair = lireCouleurs(css.slice(0, debutSombre));
const sombre = { ...clair, ...lireCouleurs(css.slice(debutSombre)) };

/** [texte, fond] : toutes les combinaisons texte/fond employées par les composants. */
const PAIRES: [string, string][] = [
  ['c-texte', 'c-fond'],
  ['c-texte', 'c-surface'],
  ['c-texte', 'c-surface-douce'],
  ['c-texte-doux', 'c-fond'],
  ['c-texte-doux', 'c-surface'],
  ['c-texte-doux', 'c-surface-douce'],
  ['c-primaire', 'c-fond'],
  ['c-primaire', 'c-surface'],
  ['c-primaire', 'c-surface-douce'],
  ['c-sur-primaire', 'c-primaire'],
  ['c-primaire-fonce', 'c-primaire-clair'],
  ['c-texte', 'c-secondaire-clair'],
  ['c-secondaire-texte', 'c-fond'],
  ['c-science', 'c-science-fond'],
  ['c-reflexion', 'c-reflexion-fond'],
];

describe('contraste', () => {
  it('reproduit des valeurs de référence', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contraste('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });
});

describe.each([
  ['clair', clair],
  ['sombre', sombre],
])('palette %s', (_, palette) => {
  it.each(PAIRES)('%s sur %s atteint 4,5:1', (texte, fond) => {
    const a = palette[texte];
    const b = palette[fond];
    expect(a, texte).toBeDefined();
    expect(b, fond).toBeDefined();
    expect(contraste(a as string, b as string)).toBeGreaterThanOrEqual(4.5);
  });
  it('le contour de focus est visible sur le fond (3:1)', () => {
    expect(
      contraste(palette['c-focus'] as string, palette['c-fond'] as string),
    ).toBeGreaterThanOrEqual(3);
  });
});
