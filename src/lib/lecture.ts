/**
 * Temps de lecture estimé, sur une base de 200 mots par minute (estimation courante pour un texte
 * informatif lu attentivement ; choix du projet, non sourcé).
 */
export const MOTS_PAR_MINUTE = 200;

export function compterMots(texte: string): number {
  const nettoye = texte
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\]\([^)]*\)/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`[\]()|-]/g, ' ');
  return nettoye.split(/\s+/).filter((m) => /\p{L}/u.test(m)).length;
}

export function minutesDeLecture(...textes: (string | undefined)[]): number {
  const mots = textes.reduce((n, t) => n + (t ? compterMots(t) : 0), 0);
  return Math.max(1, Math.round(mots / MOTS_PAR_MINUTE));
}
