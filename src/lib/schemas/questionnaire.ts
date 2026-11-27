import { z } from 'astro/zod';
import { FACETTES, FACETTE_IDS, RIASEC, TRAITS } from '../big-five';
import { idSource } from './source';

/**
 * Item d'un questionnaire. Deux questionnaires peuvent partager un item (même identifiant,
 * même texte original) : la réponse est alors réutilisée de l'un à l'autre.
 */
export const itemQuestionnaireSchema = z.object({
  id: z.string().regex(/^([NEOAC][1-6]-\d{2}|BF-\d{2}|IP-[RIASEC]\d{2})$/, 'Identifiant invalide'),
  /** Texte présenté (français pour l'IPIP, anglais original pour O*NET). */
  texte: z.string().min(1),
  texte_original: z.string().min(1),
  /** Trait Big Five ou dimension RIASEC. */
  domaine: z.string().length(1),
  facette: z.enum(FACETTE_IDS).optional(),
  cle: z.enum(['plus', 'moins']),
  /** Position de l'item dans la version publiée, si elle est définie. */
  position_originale: z.number().int().positive().optional(),
  note: z.string().optional(),
});

export type ItemQuestionnaire = z.infer<typeof itemQuestionnaireSchema>;

export const questionnaireSchema = z
  .object({
    id: z.enum(['ipip-neo-120', 'ipip-bffm-50', 'onet-ip-60', 'onet-mini-ip-30']),
    nom: z.string().min(1),
    description: z.string().min(1),
    modele: z.enum(['big-five', 'riasec']),
    source: idSource,
    sources_complementaires: z.array(idSource).default([]),
    licence: z.object({
      nom: z.string().min(1),
      url: z.url(),
      /** Mention à reproduire telle quelle lorsque la licence l'exige. */
      attribution: z.string().optional(),
    }),
    langue_items: z.enum(['fr', 'en']),
    traduction: z.object({
      statut: z.enum(['non-validee', 'validee', 'sans-objet']),
      source: idSource.optional(),
      note: z.string().optional(),
    }),
    consigne: z.string().min(1),
    echelle: z.object({
      min: z.number().int(),
      max: z.number().int(),
      libelles: z.array(z.string().min(1)),
      langue: z.enum(['fr', 'en']),
    }),
    agregation: z.enum(['moyenne', 'somme']),
    /** Part minimale d'items répondus pour calculer un score (1 = tous). */
    seuil_completude: z.number().gt(0).max(1),
    avec_facettes: z.boolean(),
    items: z.array(itemQuestionnaireSchema).min(1),
  })
  .superRefine((q, ctx) => {
    const erreur = (message: string) => ctx.addIssue({ code: 'custom', message });
    if (q.echelle.libelles.length !== q.echelle.max - q.echelle.min + 1) {
      erreur("Le nombre de libellés doit correspondre à l'étendue de l'échelle");
    }
    if (q.agregation === 'somme' && q.seuil_completude !== 1) {
      erreur('Un score en somme exige toutes les réponses (seuil_completude: 1)');
    }
    if (q.traduction.statut === 'validee' && q.traduction.source === undefined) {
      erreur('Une traduction « validee » doit citer sa source');
    }
    if ((q.langue_items === 'en') !== (q.traduction.statut === 'sans-objet')) {
      erreur('Items en anglais ⇔ traduction « sans-objet »');
    }
    const domaines: readonly string[] = q.modele === 'big-five' ? TRAITS : RIASEC;
    const ids = new Set<string>();
    for (const item of q.items) {
      if (ids.has(item.id)) erreur(`Item en double : ${item.id}`);
      ids.add(item.id);
      if (!domaines.includes(item.domaine)) erreur(`${item.id} : domaine inconnu ${item.domaine}`);
      if (q.avec_facettes !== (item.facette !== undefined)) {
        erreur(`${item.id} : facette ${q.avec_facettes ? 'manquante' : 'inattendue'}`);
      }
      if (item.facette && FACETTES[item.facette].trait !== item.domaine) {
        erreur(`${item.id} : la facette ne correspond pas au trait`);
      }
      if (q.modele === 'riasec' && item.cle !== 'plus') {
        erreur(`${item.id} : les items RIASEC ne sont pas inversés`);
      }
    }
  });

export type Questionnaire = z.infer<typeof questionnaireSchema>;
