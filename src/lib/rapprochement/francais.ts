/**
 * Passage des métiers O*NET rapprochés (calcul inchangé) aux métiers français du ROME 4.0
 * affichés sur la page de résultats. Fonctions pures, sans accès au DOM.
 * Voir docs/decisions/0010-metiers-francais-rome-rncp.md.
 */
import type { Correspondance, MetierProfil, NiveauCorrespondance } from './index';

export type StatutCorrespondance = 'valide' | 'a_valider';

export interface LienRome {
  rome: string;
  statut: StatutCorrespondance;
  /** Code OGR de l'appellation à afficher à la place de l'intitulé de la fiche. */
  appellation?: string;
  /** Spécialité à préciser (métier O*NET plus spécialisé que la fiche ROME). */
  specialite?: string;
}

export interface MetierFrancais<M extends MetierProfil> {
  rome: string;
  libelle: string;
  specialite?: string;
  /** Niveau du métier O*NET le plus proche du profil parmi ceux qui mènent à cette fiche. */
  niveau: NiveauCorrespondance;
  r: number;
  /** true si au moins un lien vers cette fiche n'a pas encore été relu. */
  nonRelue: boolean;
  /** Métiers O*NET (américains) qui mènent à cette fiche : transparence de la méthode. */
  onet: Correspondance<M>[];
}

export interface FamilleFrancaise<M extends MetierProfil> {
  famille: string;
  niveau: NiveauCorrespondance;
  metiers: MetierFrancais<M>[];
}

/**
 * Regroupe les correspondances par famille (ordre du meilleur métier, comme regrouperParFamille)
 * et remplace chaque métier O*NET par ses fiches ROME. Un métier O*NET sans fiche affichable
 * est ignoré ; une fiche atteinte par plusieurs métiers O*NET n'apparaît qu'une fois, dans la
 * famille où elle apparaît en premier. Un lien qui précise une appellation (choisie à la
 * relecture) affiche cette appellation et compte comme une entrée distincte.
 */
export function versMetiersFrancais<M extends MetierProfil>(
  correspondances: readonly Correspondance<M>[],
  table: Readonly<Record<string, readonly LienRome[]>>,
  libelles: Readonly<Record<string, string>>,
  { familles: maxFamilles = 6, parFamille = 5 } = {},
  appellations: Readonly<Record<string, string>> = {},
): FamilleFrancaise<M>[] {
  const parRome = new Map<string, MetierFrancais<M>>();
  const resultat = new Map<string, FamilleFrancaise<M>>();
  for (const c of correspondances) {
    const liens = table[c.metier.code];
    if (!liens || liens.length === 0) continue;
    for (const lien of liens) {
      const cle = `${lien.rome}|${lien.appellation ?? ''}|${lien.specialite ?? ''}`;
      const deja = parRome.get(cle);
      if (deja) {
        if (!deja.onet.includes(c)) deja.onet.push(c);
        if (lien.statut !== 'valide') deja.nonRelue = true;
        continue;
      }
      let famille = resultat.get(c.metier.famille);
      if (!famille) {
        if (resultat.size >= maxFamilles) continue;
        famille = { famille: c.metier.famille, niveau: c.niveau, metiers: [] };
        resultat.set(c.metier.famille, famille);
      }
      if (famille.metiers.length >= parFamille) continue;
      const m: MetierFrancais<M> = {
        rome: lien.rome,
        libelle:
          (lien.appellation ? appellations[lien.appellation] : undefined) ??
          libelles[lien.rome] ??
          lien.rome,
        ...(lien.specialite ? { specialite: lien.specialite } : {}),
        niveau: c.niveau,
        r: c.r,
        nonRelue: lien.statut !== 'valide',
        onet: [c],
      };
      famille.metiers.push(m);
      parRome.set(cle, m);
    }
  }
  return [...resultat.values()];
}

/** Lien vers la fiche du site ; le niveau est passé dans l'adresse (rien n'est envoyé ailleurs). */
export const lienFicheRome = (rome: string, niveau?: NiveauCorrespondance) =>
  `/metiers/rome/${rome}${niveau ? `?niveau=${niveau}` : ''}`;
