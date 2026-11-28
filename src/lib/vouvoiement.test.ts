/**
 * Vérification automatique du vouvoiement : aucun « tu, te, toi, ton, ta, tes, t' » dans les textes
 * destinés aux visiteurs. Les exceptions (citations historiques, nom « ton ») sont listées et justifiées.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = new URL('../', import.meta.url).pathname;
const DOSSIERS = ['content', 'pages', 'components', 'layouts', 'data'];
const IGNORES = [/data\/onet\//, /content\/sources\//, /\.test\.ts$/];
/** Mots de tutoiement, en mots entiers (lettres accentuées comprises). */
const TUTOIEMENT = /(?<![\p{L}'’-])(?:(?:tu|te|toi|ton|ta|tes)(?![\p{L}])|t['’](?=\p{L}))/giu;

/** Exceptions justifiées : extraits qui contiennent légitimement ces mots. */
const EXCEPTIONS: { motif: RegExp; raison: string }[] = [
  {
    motif: /Tu peux toujours, quand tu le veux, à ton heure, trouver un asile en toi-même/i,
    raison: 'citation de Marc Aurèle (domaine public)',
  },
  {
    motif: /Suis ton plan, cher Lucilius ; reprends possession de toi-même/i,
    raison: 'citation de Sénèque (domaine public)',
  },
  { motif: /le ton volontariste/i, raison: '« ton » au sens de tonalité' },
];

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? fichiers(chemin) : [chemin];
  });
}

/** Retire ce qui n'est pas du texte visible : champs originaux anglais, URL, code. */
function texteVisible(chemin: string, contenu: string): string {
  let t = contenu;
  if (chemin.endsWith('.json')) {
    t = t.replace(
      /"(texte_original|url|id|doi|isbn|preuves)"\s*:\s*("([^"\\]|\\.)*"|\[[^\]]*\])/g,
      '',
    );
  }
  t = t.replace(/https?:\/\/\S+/g, ' ').replace(/lang="en"[^>]*>[^<]*/g, ' ');
  for (const e of EXCEPTIONS) t = t.replace(new RegExp(e.motif.source, 'gi'), ' ');
  return t;
}

describe('vouvoiement partout', () => {
  it('aucun tutoiement dans les textes du site (hors exceptions justifiées)', () => {
    const trouves: string[] = [];
    for (const dossier of DOSSIERS) {
      for (const chemin of fichiers(join(RACINE, dossier))) {
        if (!/\.(md|json|astro|ts)$/.test(chemin) || IGNORES.some((r) => r.test(chemin))) continue;
        const lignes = texteVisible(chemin, readFileSync(chemin, 'utf8')).split('\n');
        lignes.forEach((ligne, i) => {
          // Ignore le code TypeScript évident (identifiants, imports).
          if (/^\s*(import|export|const|let|function|\/\/|\*)/.test(ligne)) return;
          for (const m of ligne.matchAll(TUTOIEMENT)) {
            trouves.push(
              `${chemin.replace(RACINE, '')}:${i + 1} « ${m[0]} » : ${ligne.trim().slice(0, 100)}`,
            );
          }
        });
      }
    }
    expect(trouves).toEqual([]);
  });
});

describe('détection du tutoiement', () => {
  it('repère les formes de tutoiement et ignore les faux amis', () => {
    const repere = (t: string) => [...t.matchAll(TUTOIEMENT)].map((m) => m[0].toLowerCase());
    expect(repere('Tu peux choisir ton métier, toi aussi ; t’as raison.')).toEqual([
      'tu',
      'ton',
      'toi',
      't’',
    ]);
    expect(
      repere('Une méta-analyse ; des étapes concrètes ; Épictète ; tester ; la tête.'),
    ).toEqual([]);
  });
});
