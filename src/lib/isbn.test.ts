import { describe, expect, it } from 'vitest';
import { isbnValide, lienAmazon, lienBnf, normaliserIsbn } from './isbn';

describe('isbnValide', () => {
  it('accepte des ISBN-13 et ISBN-10 corrects', () => {
    expect(isbnValide('9782100705337')).toBe(true);
    expect(isbnValide('978-2-07-032321-0')).toBe(true);
    expect(isbnValide('1554410355')).toBe(true);
    expect(isbnValide('143382955X')).toBe(true);
  });
  it('refuse une clé de contrôle fausse ou un format invalide', () => {
    expect(isbnValide('9782100705338')).toBe(false);
    expect(isbnValide('1554410356')).toBe(false);
    expect(isbnValide('97821007')).toBe(false);
  });
  it('normalise tirets et espaces', () => {
    expect(normaliserIsbn('978-2 07-032321-0')).toBe('9782070323210');
  });
});

describe('liens de recherche', () => {
  it('encode la requête, sans identifiant d’affiliation', () => {
    expect(lienBnf('9782100705337')).toContain('motRecherche=9782100705337');
    expect(lienAmazon('Propos sur le bonheur Alain')).toBe(
      'https://www.amazon.fr/s?k=Propos%20sur%20le%20bonheur%20Alain',
    );
    expect(lienAmazon('x')).not.toMatch(/tag=|ref=/);
  });
});
