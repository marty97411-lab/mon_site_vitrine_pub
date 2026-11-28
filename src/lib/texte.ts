/** Segment de texte, en italique ou non. */
export interface Segment {
  texte: string;
  italique: boolean;
}

/**
 * Découpe un texte où l'italique est noté « *ainsi* » (syntaxe Markdown minimale), pour un rendu
 * sans HTML brut. Un astérisque isolé reste tel quel.
 */
export function segmenterItalique(texte: string): Segment[] {
  const segments: Segment[] = [];
  const motif = /\*([^*\n]+)\*/g;
  let debut = 0;
  for (const m of texte.matchAll(motif)) {
    if (m.index > debut) segments.push({ texte: texte.slice(debut, m.index), italique: false });
    segments.push({ texte: m[1] ?? '', italique: true });
    debut = m.index + m[0].length;
  }
  if (debut < texte.length) segments.push({ texte: texte.slice(debut), italique: false });
  return segments;
}
