// @ts-check
import { defineConfig } from 'astro/config';

// Site entièrement statique : aucune réponse au questionnaire ne quitte le navigateur.
export default defineConfig({
  output: 'static',
  // TODO(déploiement) : renseigner `site` (et `base` pour GitHub Pages) une fois l'hébergeur choisi.
  trailingSlash: 'ignore',
  // La compression HTML supprime les espaces entre un texte et un lien placé à la ligne suivante
  // (« navigateur.<a> »). On la désactive : le gain de poids est négligeable pour ce site.
  compressHTML: false,
  // Ancienne adresse du questionnaire (étape 1).
  redirects: {
    '/test': '/parcours',
    // Section « Comprendre » renommée « Explication » (étape 5).
    '/comprendre': '/explication',
    '/comprendre/interets': '/explication/interets',
  },
});
