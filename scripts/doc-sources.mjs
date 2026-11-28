#!/usr/bin/env node
/**
 * Génère docs/sources.md à partir de src/content/sources/sources.json (source unique).
 * Usage : npm run doc:sources
 */
import { readFile, writeFile } from 'node:fs/promises';

const sources = JSON.parse(
  await readFile(new URL('../src/content/sources/sources.json', import.meta.url), 'utf8'),
);

const CATEGORIES = [
  ['Questionnaires de personnalité (IPIP)', /^(ipip|johnson|goldberg|thiry)/],
  [
    'Questionnaires d’intérêts et rapprochement (O*NET)',
    /^(onet-ip|rounds|onet-career|onet-tools|gregory)/,
  ],
  ['Métiers et données O*NET', /^(onet-31|onet-online|onet-familles|rome)/],
  ['Personnalité, intérêts et travail', /^(larson|barrick|holland|armstrong)/],
  [
    'Évolution de la personnalité et des intérêts, carrière, motivation',
    /^(roberts|low|savickas|mitchell|krumboltz|wrzesniewski|deci|ryan)/,
  ],
  ['Philosophie', /^(aristote|epictete|marc-aurele|seneque|montaigne|weil|sartre|arendt)/],
  ['Ikigai', /^(mathews|kumano|kamiya)/],
  ['Ressources d’accompagnement', /^(site-3114|mon-cep|onisep|france-travail)/],
  ['Formation en France', /^cadre-national/],
  ['Méthodes', /^abramowitz/],
];

const STATUT = {
  verifie: '✅ vérifié',
  'metadonnees-verifiees': '🟡 référence vérifiée, contenu à relire',
  'a-verifier': '⚠️ à vérifier',
};

const echapper = (t) =>
  String(t ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
const lien = (s) =>
  s.doi ? `[doi:${s.doi}](https://doi.org/${s.doi})` : s.url ? `<${s.url}>` : '—';
const reference = (s) =>
  `${s.auteurs.join(', ')} (${s.annee ?? 's. d.'}). *${s.titre}*${s.publication ? `. ${s.publication}` : ''}${s.volume ? `, ${s.volume}` : ''}${s.pages ? `, ${s.pages}` : ''}.`;

const restantes = new Set(sources.map((s) => s.id));
let md = `# Sources scientifiques et données

> Fichier **généré** par \`npm run doc:sources\` à partir de \`src/content/sources/sources.json\`,
> qui fait foi. Ne pas modifier à la main.

**Statuts**

- ✅ **vérifié** : source consultée et contenu contrôlé (date de consultation indiquée).
- 🟡 **référence vérifiée, contenu à relire** : métadonnées et DOI vérifiés dans Crossref ; le
  contenu de l'article n'a pas encore été relu. Le site n'en tire aucun chiffre.
- ⚠️ **à vérifier** : référence citée de mémoire ou incomplète.

`;
const ajouterSection = (titre, liste) => {
  if (liste.length === 0) return;
  md += `## ${titre}\n\n| Id | Référence | Lien | Licence | Statut | Notes |\n| --- | --- | --- | --- | --- | --- |\n`;
  for (const s of liste) {
    md += `| \`${s.id}\` | ${echapper(reference(s))} | ${lien(s)} | ${echapper(s.licence ?? '—')} | ${STATUT[s.statut]}${s.consulte_le ? ` (${s.consulte_le})` : ''} | ${echapper(s.notes ?? '')} |\n`;
    restantes.delete(s.id);
  }
  md += '\n';
};
for (const [titre, motif] of CATEGORIES) {
  ajouterSection(
    titre,
    sources.filter((s) => restantes.has(s.id) && motif.test(s.id)),
  );
}
ajouterSection(
  'Autres',
  sources.filter((s) => restantes.has(s.id)),
);

const compte = (st) => sources.filter((s) => s.statut === st).length;
md += `## Bilan

- ${sources.length} sources : ${compte('verifie')} vérifiées, ${compte('metadonnees-verifiees')} à relire (référence vérifiée), ${compte('a-verifier')} à vérifier.

## Données et vérifications encore manquantes (TODO)

- Relire le contenu des articles au statut « contenu à relire » avant d'en citer des résultats.
- Vérifier l'origine du diagramme de l'ikigai à quatre cercles.
- Vérifier les références de Sartre (1946), Arendt (1958), Holland (1997), Kamiya (1966), ROME.
- Sourcer les atouts et coûts des traits, et l'avertissement « la personnalité n'explique qu'une
  partie de la réussite et de la satisfaction au travail ».
- Vérifier sur une source officielle les numéros d'urgence 15 et 112 et l'annuaire des CIO.
- Étude de validation de la traduction des questionnaires O*NET (exigée par leur licence).
`;
await writeFile(new URL('../docs/sources.md', import.meta.url), md);
console.log(`docs/sources.md généré (${sources.length} sources).`);
