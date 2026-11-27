# Questionnaires

Un fichier JSON par questionnaire, validé par `questionnaireSchema` (`src/lib/schemas/questionnaire.ts`).

| Fichier                | Source des items                                                                                                     | Licence        | Langue                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------- |
| `ipip-neo-120.json`    | <https://ipip.ori.org/30FacetNEO-PI-RItems.htm> (Johnson, 2014)                                                      | Domaine public | Français (traduction non validée) |
| `ipip-bffm-50.json`    | <https://ipip.ori.org/New_IPIP-50-item-scale.htm> et <https://ipip.ori.org/newBigFive5broadKey.htm> (Goldberg, 1992) | Domaine public | Français (traduction non validée) |
| `onet-ip-60.json`      | <https://www.onetcenter.org/dl_tools/ipsf/Interest_Profiler.pdf>                                                     | CC BY-ND 4.0   | Anglais, à l'identique            |
| `onet-mini-ip-30.json` | Rounds et coll. (2016), annexe A, <https://www.onetcenter.org/reports/Mini-IP.html>                                  | CC BY-ND 4.0   | Anglais, à l'identique            |

Toutes les sources ont été consultées le 2026-11-27. Textes et clés extraits automatiquement des
pages ci-dessus, puis contrôlés par les tests de `src/lib/schemas/donnees.test.ts`.

**Identifiants**

- IPIP-NEO-120 : `<facette>-<rang>`, rang = position de l'item dans sa facette sur la page IPIP.
- Marqueurs de Goldberg : identifiant de l'IPIP-NEO-120 si le même item y figure, sinon `BF-<position>`.
- Interest Profiler : `IP-<dimension><rang>`, rang = position dans le bloc de la dimension du PDF.
  Le Mini-IP réutilise les identifiants de l'IP 60.

**Ne jamais modifier** le texte des items O*NET (licence CC BY-ND).
