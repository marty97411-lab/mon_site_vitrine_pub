/** Cotation des quatre questionnaires réels, avec des réponses dont le résultat se calcule à la main. */
import { describe, expect, it } from 'vitest';
import neo from '../../data/questionnaires/ipip-neo-120.json';
import bffm from '../../data/questionnaires/ipip-bffm-50.json';
import ip60 from '../../data/questionnaires/onet-ip-60.json';
import mini from '../../data/questionnaires/onet-mini-ip-30.json';
import { questionnaireSchema, type Questionnaire } from '../schemas';
import { calculerProfil } from './scores';
import { codeRiasec, profilRiasec } from './riasec';

const charger = (q: unknown): Questionnaire => questionnaireSchema.parse(q);
const repondre = (q: Questionnaire, f: (i: Questionnaire['items'][number]) => number) =>
  Object.fromEntries(q.items.map((i) => [i.id, f(i)]));

describe('IPIP-NEO-120', () => {
  const q = charger(neo);

  it('donne 5 partout si l’on va toujours dans le sens de la clé', () => {
    const p = calculerProfil(
      q,
      repondre(q, (i) => (i.cle === 'plus' ? 5 : 1)),
    );
    expect(Object.values(p.domaines).map((s) => s.valeur)).toEqual([5, 5, 5, 5, 5]);
    expect(Object.keys(p.facettes)).toHaveLength(30);
    for (const s of Object.values(p.facettes)) expect(s.valeur).toBe(5);
  });

  it('donne 3 partout avec des réponses neutres', () => {
    const p = calculerProfil(
      q,
      repondre(q, () => 3),
    );
    for (const s of Object.values(p.domaines)) expect(s.valeur).toBe(3);
  });

  it('calcule une facette à la main : C6 Prudence (4 items inversés)', () => {
    // Tous les items de C6 sont à clé négative : répondre 2 partout donne 6 − 2 = 4.
    const p = calculerProfil(
      q,
      repondre(q, (i) => (i.facette === 'C6' ? 2 : 3)),
    );
    expect(p.facettes['C6']?.valeur).toBe(4);
    // Trait C : 20 items à 3 et 4 items à 4 → (60 + 16) / 24.
    expect(p.domaines['C']?.valeur).toBeCloseTo(76 / 24, 12);
  });
});

describe('IPIP Big-Five Factor Markers (50)', () => {
  const q = charger(bffm);

  it('ne produit pas de facettes', () => {
    expect(
      calculerProfil(
        q,
        repondre(q, () => 3),
      ).facettes,
    ).toEqual({});
  });

  it('exprime le facteur IV en névrosisme : « Am relaxed most of the time » est inversé', () => {
    const detendu = q.items.find((i) => i.texte_original === 'Am relaxed most of the time.');
    expect(detendu?.domaine).toBe('N');
    expect(detendu?.cle).toBe('moins');
    // Très exact (5) à cet item et neutre ailleurs : N = (9 × 3 + 1) / 10.
    const p = calculerProfil(
      q,
      repondre(q, (i) => (i === detendu ? 5 : 3)),
    );
    expect(p.domaines['N']?.valeur).toBeCloseTo(2.8, 12);
  });
});

describe('O*NET Interest Profiler (60) et Mini-IP (30)', () => {
  const valeurs = { R: 0, I: 1, A: 2, S: 4, E: 3, C: 2 } as const;
  const reponses = (q: Questionnaire) =>
    repondre(q, (i) => valeurs[i.domaine as keyof typeof valeurs]);

  it('IP 60 : somme de 10 items de 0 à 4 par dimension (0 à 40)', () => {
    const q = charger(ip60);
    const p = calculerProfil(q, reponses(q));
    expect(profilRiasec(p)).toEqual({ R: 0, I: 10, A: 20, S: 40, E: 30, C: 20 });
    expect(p.domaines['S']?.max).toBe(40);
    expect(codeRiasec(profilRiasec(p) ?? { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })).toEqual({
      code: 'SEA',
      egalite: true, // A et C à égalité (20)
    });
  });

  it('Mini-IP : somme de 5 items par dimension (0 à 20)', () => {
    const q = charger(mini);
    const p = calculerProfil(q, reponses(q));
    expect(profilRiasec(p)).toEqual({ R: 0, I: 5, A: 10, S: 20, E: 15, C: 10 });
    expect(p.domaines['S']?.max).toBe(20);
  });

  it('les réponses du Mini-IP sont réutilisables dans l’IP 60 (mêmes identifiants)', () => {
    const qMini = charger(mini);
    const qIp = charger(ip60);
    const p = calculerProfil(qIp, reponses(qMini));
    expect(Object.values(p.domaines).every((s) => s.nbRepondus === 5 && s.valeur === null)).toBe(
      true,
    );
  });
});
