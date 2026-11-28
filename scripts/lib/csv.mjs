/**
 * Analyseur CSV minimal (RFC 4180) : champs entre guillemets, guillemets doublés,
 * sauts de ligne dans les champs. Suffisant pour les fichiers CSV de la base O*NET.
 * @param {string} texte
 * @param {string} [separateur] virgule par défaut ; point-virgule pour les tables françaises
 * @returns {string[][]}
 */
export function analyserCsv(texte, separateur = ',') {
  const lignes = [];
  let ligne = [];
  let champ = '';
  let entreGuillemets = false;
  const t = texte.charCodeAt(0) === 0xfeff ? texte.slice(1) : texte;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (entreGuillemets) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          champ += '"';
          i++;
        } else {
          entreGuillemets = false;
        }
      } else {
        champ += c;
      }
    } else if (c === '"') {
      entreGuillemets = true;
    } else if (c === separateur) {
      ligne.push(champ);
      champ = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      ligne.push(champ);
      lignes.push(ligne);
      ligne = [];
      champ = '';
    } else {
      champ += c;
    }
  }
  if (champ !== '' || ligne.length > 0) {
    ligne.push(champ);
    lignes.push(ligne);
  }
  return lignes;
}

/**
 * Convertit un CSV avec en-tête en tableau d'objets.
 * @param {string} texte
 * @param {string} [separateur]
 * @returns {Record<string, string>[]}
 */
export function csvVersObjets(texte, separateur = ',') {
  const [entete, ...lignes] = analyserCsv(texte, separateur);
  if (!entete) return [];
  return lignes
    .filter((l) => l.length > 1 || (l.length === 1 && l[0] !== ''))
    .map((l) => Object.fromEntries(entete.map((nom, i) => [nom, l[i] ?? ''])));
}
