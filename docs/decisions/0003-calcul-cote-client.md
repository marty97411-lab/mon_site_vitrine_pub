# 0003. Calculs dans le navigateur, aucune donnée envoyée

- **Statut** : accepté (2026-11-27)

## Décision

- Le score est calculé dans le navigateur (`src/lib/scoring/`), sans aucune requête réseau.
- Les réponses sont conservées dans `sessionStorage` (effacé à la fermeture de l'onglet), avec un
  bouton pour les effacer. Pas de `localStorage`, pas de cookies, pas d'analytics, pas de compte.
- Aucune ressource externe (polices, CDN, scripts tiers) n'est chargée.

## Conséquences

Respect du RGPD par conception : aucun traitement de données personnelles côté serveur. Le site a
besoin de JavaScript pour afficher les résultats (un message `<noscript>` l'indique).
