import { describe, expect, it } from 'vitest';
import {
  affirmationSchema,
  livreSchema,
  metierSchema,
  normesSchema,
  questionnaireSchema,
} from './index';

describe('affirmationSchema', () => {
  it('refuse une affirmation sans source ni TODO', () => {
    expect(affirmationSchema.safeParse({ texte: 'Affirmation' }).success).toBe(false);
  });
  it('accepte une affirmation sourcée ou marquée TODO', () => {
    expect(affirmationSchema.safeParse({ texte: 'A', sources: ['ipip'] }).success).toBe(true);
    expect(affirmationSchema.safeParse({ texte: 'A', todo_source: true }).success).toBe(true);
  });
});

const base = {
  id: 'ipip-bffm-50',
  nom: 'Test',
  description: 'Test',
  modele: 'big-five',
  source: 'goldberg-1992',
  licence: { nom: 'Domaine public', url: 'https://ipip.ori.org/newPermission.htm' },
  langue_items: 'fr',
  traduction: { statut: 'non-validee' },
  consigne: 'Consigne',
  echelle: { min: 1, max: 5, libelles: ['1', '2', '3', '4', '5'], langue: 'fr' },
  agregation: 'moyenne',
  seuil_completude: 0.5,
  avec_facettes: false,
  items: [{ id: 'BF-01', texte: 'Texte', texte_original: 'Text', domaine: 'E', cle: 'plus' }],
};

describe('questionnaireSchema', () => {
  it('accepte un questionnaire valide', () => {
    expect(questionnaireSchema.safeParse(base).success).toBe(true);
  });
  it('refuse un nombre de libellés incohérent avec l’échelle', () => {
    const echelle = { ...base.echelle, libelles: ['1', '2'] };
    expect(questionnaireSchema.safeParse({ ...base, echelle }).success).toBe(false);
  });
  it('refuse une somme sans exigence de complétude', () => {
    expect(questionnaireSchema.safeParse({ ...base, agregation: 'somme' }).success).toBe(false);
  });
  it('refuse un domaine étranger au modèle', () => {
    const items = [{ ...base.items[0], domaine: 'R' }];
    expect(questionnaireSchema.safeParse({ ...base, items }).success).toBe(false);
  });
  it('refuse une facette dans un questionnaire sans facettes', () => {
    const items = [{ ...base.items[0], id: 'E1-01', facette: 'E1' }];
    expect(questionnaireSchema.safeParse({ ...base, items }).success).toBe(false);
  });
  it('refuse un item RIASEC inversé', () => {
    const q = {
      ...base,
      id: 'onet-mini-ip-30',
      modele: 'riasec',
      langue_items: 'en',
      traduction: { statut: 'sans-objet' },
      items: [{ id: 'IP-R01', texte: 'T', texte_original: 'T', domaine: 'R', cle: 'moins' }],
    };
    expect(questionnaireSchema.safeParse(q).success).toBe(false);
  });
  it('refuse des items en anglais présentés comme traduits', () => {
    expect(questionnaireSchema.safeParse({ ...base, langue_items: 'en' }).success).toBe(false);
  });
});

const justification = { texte: 'J', todo_source: true };
const metierValide = {
  intitule: 'Exemple',
  codes: { onet: '29-1141.00' },
  riasec: { code: 'SCI', source: 'onet-online' },
  traits_pertinents: [{ trait: 'A', facettes: ['A3'], sens: 'eleve', justification }],
  points_forts: [justification],
  points_vigilance: [justification],
  sources: ['onet-online'],
  statut: 'exemple',
};

describe('metierSchema', () => {
  it('accepte un métier valide et exige un code', () => {
    expect(metierSchema.safeParse(metierValide).success).toBe(true);
    expect(metierSchema.safeParse({ ...metierValide, codes: {} }).success).toBe(false);
  });
});

describe('normesSchema', () => {
  const vide = { moyenne: null, ecart_type: null };
  const normes = {
    instrument: 'IPIP-NEO-120',
    statut: 'todo',
    source: null,
    population: null,
    echelle: { min: 1, max: 5 },
    traits: { O: vide, C: vide, E: vide, A: vide, N: vide },
    facettes: {},
  };
  it('refuse des normes « verifie » sans source', () => {
    expect(normesSchema.safeParse(normes).success).toBe(true);
    expect(normesSchema.safeParse({ ...normes, statut: 'verifie' }).success).toBe(false);
  });
});

describe('livreSchema', () => {
  // Livre fictif, pour le test uniquement.
  const livre = {
    id: 'livre-test',
    titre: 'Titre',
    auteurs: ['Auteur'],
    annee: 1900,
    editeur: 'Éditeur',
    isbn: null,
    langue: 'fr',
    domaine_public: true,
    etiquette: 'philosophie',
    niveau: 'accessible',
    themes: ['philosophie-de-vie'],
    resume: 'Résumé',
    pour_qui: 'Pour qui…',
    a_garder_en_tete: 'À garder en tête',
    verification: { date: '2026-11-28', preuves: ['notice'] },
  };
  const edition = {
    editeur: 'Éditeur',
    isbn: '9782080709479',
    poche: true,
    preuves: ['notice'],
    a_confirmer: true,
  };
  it('accepte une édition accessible avec un ISBN valide et des preuves', () => {
    const r = livreSchema.safeParse({ ...livre, edition_accessible: edition });
    expect(r.success).toBe(true);
    expect(r.success && r.data.autres_titres).toEqual([]);
  });
  it("refuse une édition accessible à l'ISBN invalide ou sans preuve", () => {
    expect(
      livreSchema.safeParse({
        ...livre,
        edition_accessible: { ...edition, isbn: '9782080709470' },
      }).success,
    ).toBe(false);
    expect(
      livreSchema.safeParse({ ...livre, edition_accessible: { ...edition, preuves: [] } }).success,
    ).toBe(false);
  });
});
