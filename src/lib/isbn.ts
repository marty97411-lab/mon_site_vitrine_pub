/** Validation des ISBN-10 et ISBN-13 (chiffre de contrôle) et liens de recherche associés. */

export function normaliserIsbn(isbn: string): string {
  return isbn.replace(/[\s-]/g, '').toUpperCase();
}

export function isbnValide(isbn: string): boolean {
  const n = normaliserIsbn(isbn);
  if (/^\d{13}$/.test(n)) {
    const somme = [...n.slice(0, 12)].reduce((s, c, i) => s + Number(c) * (i % 2 === 0 ? 1 : 3), 0);
    return (10 - (somme % 10)) % 10 === Number(n[12]);
  }
  if (/^\d{9}[\dX]$/.test(n)) {
    const somme = [...n].reduce((s, c, i) => s + (c === 'X' ? 10 : Number(c)) * (10 - i), 0);
    return somme % 11 === 0;
  }
  return false;
}

/** Recherche dans le catalogue général de la BnF (par ISBN, sinon par titre et auteur). */
export function lienBnf(requete: string): string {
  return `https://catalogue.bnf.fr/rechercher.do?motRecherche=${encodeURIComponent(requete)}&critereRecherche=0`;
}

/** Recherche simple sur Amazon, sans identifiant d'affiliation. */
export function lienAmazon(requete: string): string {
  return `https://www.amazon.fr/s?k=${encodeURIComponent(requete)}`;
}
