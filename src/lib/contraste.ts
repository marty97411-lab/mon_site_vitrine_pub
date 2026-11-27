/** Calcul du rapport de contraste WCAG 2.x entre deux couleurs hexadécimales (#rrggbb). */

function canal(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Couleur invalide : ${hex}`);
  const n = parseInt(m[1], 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Extrait les variables --c-* d'un bloc CSS. */
export function lireCouleurs(css: string): Record<string, string> {
  const couleurs: Record<string, string> = {};
  for (const m of css.matchAll(/--(c-[a-z-]+):\s*(#[0-9a-f]{6})/gi)) {
    if (m[1] && m[2]) couleurs[m[1]] = m[2];
  }
  return couleurs;
}
