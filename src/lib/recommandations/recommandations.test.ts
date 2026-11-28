import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import configJson from '../../data/recommandations.json';
import livresJson from '../../content/livres/livres.json';
import auteursJson from '../../content/livres/auteurs-a-verifier.json';
import {
  auteurAVerifierSchema,
  livreSchema,
  recommandationsSchema,
  type ConfigRecommandations,
} from '../schemas';
import { conditionRemplie, suggerer, type ProfilPourSuggestions } from './index';

const config = recommandationsSchema.parse(configJson);
const neutre: ProfilPourSuggestions = {
  traits: { O: 3, C: 3, E: 3, A: 3, N: 3 },
  riasec: { R: 2, I: 10, A: 4, S: 18, E: 12, C: 6 },
  riasecMax: 20,
};

// Configuration fictive, réservée aux tests.
const fictive: ConfigRecommandations = {
  note: 'test',
  minimum: 2,
  maximum: 3,
  regles: [
    {
      id: 'n',
      raison: 'N élevé',
      si: { type: 'trait', trait: 'N', min: 3.5 },
      articles: ['philosophie/stoiciens'],
      livres: ['l1', 'l2'],
    },
    {
      id: 'o',
      raison: 'O élevé',
      si: { type: 'trait', trait: 'O', min: 3.5 },
      articles: ['philosophie/sartre'],
      livres: ['l2', 'l3', 'l4'],
    },
    {
      id: 'defaut',
      raison: 'pour tous',
      si: { type: 'toujours' },
      articles: ['philosophie/montaigne', 'situations/je-ne-sais-pas'],
      livres: ['l9'],
    },
  ],
};

describe('conditionRemplie', () => {
  it('compare un trait aux bornes incluses', () => {
    expect(
      conditionRemplie({ type: 'trait', trait: 'N', min: 3.5 }, { ...neutre, traits: { N: 3.5 } }),
    ).toBe(true);
    expect(
      conditionRemplie({ type: 'trait', trait: 'N', min: 3.5 }, { ...neutre, traits: { N: 3.49 } }),
    ).toBe(false);
    expect(
      conditionRemplie({ type: 'trait', trait: 'C', max: 2.5 }, { ...neutre, traits: { C: 2.5 } }),
    ).toBe(true);
  });
  it('ignore un trait non calculé', () => {
    expect(conditionRemplie({ type: 'trait', trait: 'N', min: 1 }, { ...neutre, traits: {} })).toBe(
      false,
    );
  });
  it('reconnaît la dimension RIASEC dominante, y compris en cas d’égalité', () => {
    expect(conditionRemplie({ type: 'riasec-dominant', lettres: ['S'] }, neutre)).toBe(true);
    const egalite = { ...neutre, riasec: { R: 18, I: 1, A: 1, S: 18, E: 1, C: 1 } };
    expect(conditionRemplie({ type: 'riasec-dominant', lettres: ['R'] }, egalite)).toBe(true);
    expect(conditionRemplie({ type: 'riasec-dominant', lettres: ['I'] }, neutre)).toBe(false);
  });
  it('mesure la différenciation RIASEC relativement au maximum', () => {
    const plat = { ...neutre, riasec: { R: 8, I: 9, A: 10, S: 12, E: 9, C: 8 } }; // écart 4/20 = 0,2
    expect(conditionRemplie({ type: 'riasec-peu-differencie', ecart_max: 0.25 }, plat)).toBe(true);
    expect(conditionRemplie({ type: 'riasec-peu-differencie', ecart_max: 0.25 }, neutre)).toBe(
      false,
    ); // 16/20
  });
});

describe('suggerer', () => {
  it('complète avec la règle par défaut jusqu’au minimum', () => {
    const s = suggerer(fictive, neutre);
    expect(s.articles.map((a) => a.id)).toEqual([
      'philosophie/montaigne',
      'situations/je-ne-sais-pas',
    ]);
    expect(s.livres.map((l) => l.id)).toEqual(['l9']);
    expect(s.articles[0]?.raisons).toEqual(['pour tous']);
  });
  it('applique les règles dans l’ordre, fusionne les doublons et tronque au maximum', () => {
    const s = suggerer(fictive, { ...neutre, traits: { N: 4, O: 4 } });
    expect(s.livres.map((l) => l.id)).toEqual(['l1', 'l2', 'l3']);
    expect(s.livres[1]?.raisons).toEqual(['N élevé', 'O élevé']);
    expect(s.articles.map((a) => a.id)).toEqual(['philosophie/stoiciens', 'philosophie/sartre']);
  });
  it('sur les vraies règles : névrosisme élevé → stoïciens en premier', () => {
    const s = suggerer(config, { ...neutre, traits: { ...neutre.traits, N: 4.2 } });
    expect(s.articles[0]?.id).toBe('philosophie/stoiciens');
    expect(s.articles.length).toBeGreaterThanOrEqual(config.minimum);
    expect(s.livres.length).toBeGreaterThanOrEqual(config.minimum);
    expect(s.livres.length).toBeLessThanOrEqual(config.maximum);
  });
  it('sur les vraies règles : profil RIASEC peu différencié → « Je ne sais pas »', () => {
    const s = suggerer(config, { ...neutre, riasec: { R: 10, I: 11, A: 12, S: 13, E: 11, C: 10 } });
    expect(s.articles.map((a) => a.id)).toContain('situations/je-ne-sais-pas');
  });
  it('fonctionne sans aucun score (règle par défaut seule)', () => {
    const s = suggerer(config, { traits: {}, riasec: null, riasecMax: 0 });
    expect(s.articles.length).toBe(config.minimum);
    expect(s.livres.length).toBe(config.minimum);
  });
});

describe('fichiers de données', () => {
  const livres = livresJson.map((l) => livreSchema.parse(l));
  const idsLivres = new Set(livres.map((l) => l.id));

  it('livres.json respecte le schéma, sans identifiant en double, 30 à 50 livres', () => {
    expect(idsLivres.size).toBe(livres.length);
    expect(livres.length).toBeGreaterThanOrEqual(30);
    expect(livres.length).toBeLessThanOrEqual(50);
  });
  it('chaque livre contesté porte une note de controverse explicite', () => {
    for (const id of [
      'dweck-changer-etat-esprit',
      'kahneman-systeme-1-systeme-2',
      'graeber-bullshit-jobs',
    ]) {
      expect(livres.find((l) => l.id === id)?.note_controverse, id).toBeTruthy();
    }
  });
  it('les règles ne citent que des livres et des articles existants', () => {
    for (const regle of config.regles) {
      for (const id of regle.livres) expect(idsLivres.has(id), `${regle.id} → ${id}`).toBe(true);
      for (const id of regle.articles) {
        const chemin = new URL(`../../content/${id}.md`, import.meta.url);
        expect(existsSync(chemin), `${regle.id} → ${id}`).toBe(true);
      }
    }
  });
  it('les auteurs à vérifier respectent leur schéma, sans titre de livre ni doublon avec les livres', () => {
    const auteurs = auteursJson.map((a) => auteurAVerifierSchema.parse(a));
    expect(new Set(auteurs.map((a) => a.id)).size).toBe(auteurs.length);
    const auteursLivres = new Set(livres.flatMap((l) => l.auteurs));
    for (const a of auteurs) {
      expect(auteursLivres.has(a.nom), a.nom).toBe(false);
      expect(a.presentation, a.nom).not.toMatch(/[«»].*[«»].*\(\d{4}\)/);
    }
  });
  it('la dernière règle est une règle « toujours »', () => {
    expect(config.regles.at(-1)?.si.type).toBe('toujours');
  });
});

describe('decrireCondition', () => {
  it('rend les règles lisibles', async () => {
    const { decrireCondition } = await import('./index');
    expect(decrireCondition({ type: 'trait', trait: 'N', min: 3.5 })).toBe(
      'Névrosisme : score moyen au moins 3,5 sur 5',
    );
    expect(decrireCondition({ type: 'riasec-dominant', lettres: ['S', 'E'] })).toBe(
      'Intérêt dominant : Social ou Entreprenant',
    );
    expect(decrireCondition({ type: 'riasec-peu-differencie', ecart_max: 0.25 })).toContain('25 %');
  });
});
