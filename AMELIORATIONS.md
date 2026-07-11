# Audit & pistes d'amélioration — juillet 2026

Ce document liste des initiatives concrètes, classées par priorité. Chaque entrée est
autonome : problème → solution → fichiers à toucher → effort (S/M/L).
Une session future peut implémenter n'importe quelle entrée isolément, dans l'ordre des priorités.

**Rappels d'architecture pour la session qui implémente :**
- Client React/Vite dans `client/`, serveur Express + SQLite (node-sqlite3-wasm) dans `server/`.
- La prod (Railway) sert le build statique commité dans `server/public/` → après toute modif client,
  faire `npm run build` dans `client/` puis remplacer `server/public/` (rm assets+index.html, cp -r client/dist/*).
- Migrations DB : pattern "rebuild de table" dans `server/src/db/database.js` (voir `migrateCoachNullable`),
  toujours idempotentes (vérifier l'état avant d'agir), la DB de prod vit sur un volume Railway.
- Pas de suite de tests : vérifier en local (npm run dev, proxy Vite → 3001) avant de builder.
- Le push GitHub depuis les sessions Claude échoue (403) : générer un patch `git format-patch -1 HEAD --binary --stdout`
  et le faire appliquer par l'utilisateur (`git am`), qui pousse lui-même.

---

## P1 — Bugs réels et risques

### 1. Accès non protégé : n'importe qui avec l'URL peut devenir manager
**Problème.** Depuis la suppression des mots de passe, l'app en prod (URL publique Railway) permet à
quiconque de cliquer sur un profil — y compris manager — et d'obtenir tous les droits. La création
de profil (`POST /api/auth/profiles`) est aussi publique.
**Solution.** Code PIN optionnel à 4 chiffres par profil : colonne `pin TEXT` (nullable) sur `app_users`
(migration `tryAlter ADD COLUMN`, pas besoin de rebuild). Un manager peut définir/retirer le PIN d'un
profil dans Paramètres > Utilisateurs. À la sélection d'un profil qui a un PIN, `ProfilePicker.jsx`
affiche un pavé 4 chiffres ; `POST /api/auth/select` vérifie `{ user_id, pin }` et renvoie 401 sinon.
Icône cadenas discrète sur les bulles protégées. Ne surtout PAS re-hasher lourdement : un simple
stockage du PIN suffit pour ce niveau de menace (protection anti-curieux, pas anti-attaquant).
Optionnel : n'autoriser la création de profil qu'aux sessions manager une fois qu'au moins un manager existe.
**Fichiers.** `server/src/db/database.js`, `server/src/routes/auth.js`, `client/src/pages/ProfilePicker.jsx`,
`client/src/pages/Settings.jsx` (champ PIN dans UserModal). **Effort M.**

### 2. ✅ Fuseau horaire : la déconnexion "6h du matin" est en réalité 8h (été) — CORRIGÉ
**Problème.** Le conteneur Railway est en UTC. `expiresAtMorning()` (`server/src/routes/auth.js`) fait
`setHours(6)` en heure serveur → expiration à 06:00 UTC = 08:00 heure française l'été. Les dates de
séances utilisent aussi l'heure locale du serveur.
**Solution appliquée.** `process.env.TZ = process.env.TZ || 'Europe/Paris'` tout en haut de
`server/src/index.js`, avant tout `require`. Pas besoin de configurer Railway : c'est un défaut dans
le code, qui reste modifiable via une vraie variable d'env si besoin. Vérifié : une session créée le
9/7/2026 expire bien à `2026-07-10T06:00:00` heure de Paris (`04:00:00Z`).

**Bug lié trouvé et corrigé au passage :** l'onglet Historique (`Settings.jsx`) affichait aussi les
heures avec 2h de retard en été — cause différente (`created_at` stocké en UTC via `datetime('now')`
de SQLite, sans indicateur de fuseau, mal interprété comme heure locale par le navigateur). Fix :
`parseServerDate()` dans `client/src/lib/utils.js`, qui force explicitement l'UTC avant conversion.

### 3. ✅ Session expirée : l'app reste affichée et toutes les actions échouent en silence — CORRIGÉ
**Problème.** Après l'expiration du matin, si l'onglet était resté ouvert, chaque clic provoque une
erreur "Session expirée" mais l'utilisateur reste sur la page (le `catch` avale souvent l'erreur).
**Solution appliquée.** Dans `client/src/lib/api.js`, `req()` détecte tout `401` (hors `/auth/select`
lui-même) : purge `fm_token` et redirige vers `/login`, où l'utilisateur retombe sur le sélecteur de
profils. Ne touche pas `AuthContext.jsx` (son check initial `/auth/me` passe par `fetch` brut, pas par
`req()`, donc aucun risque de boucle de redirection au chargement).

### 4. ✅ Seed des cours : 19 cours sur 27 silencieusement perdus sur une installation neuve — CORRIGÉ
**Problème.** `server/src/db/seed.js` insère des catégories `bike` et `salle`, mais la contrainte
`CHECK(categorie IN ('aqua','fitness'))` de `cours_types` + `INSERT OR IGNORE` fait que ces lignes
sont ignorées sans erreur. La prod n'est pas touchée (ses données existaient avant), mais toute
nouvelle installation n'aura que les 8 cours aqua.
**Solution appliquée.** `bike`/`salle` remplacés par `fitness` dans `seed.js`. Vérifié en local :
« ✅ Seed cours_types — 27 types insérés/ignorés » (contre 8 avant le fix).

### 5. ✅ Le "✕" du sélecteur de pointeur SUPPRIMAIT le pointeur de la base — CORRIGÉ
**Problème.** Dans `SeanceModal.jsx` (`PointeurSelector`), le bouton ✕ à côté du select ressemble à
"désélectionner" mais appelait `api.deletePointeur(id)` → suppression définitive pour tout le monde.
**Solution appliquée.** Le ✕ ne fait plus que vider la sélection (`onChange('')`). Un second bouton 🗑
distinct gère la vraie suppression, avec un `confirm()` explicite nommant le pointeur. Vérifié : après
clic sur ✕, le pointeur reste bien présent en base.

### 6. ✅ Navbar : débordement sur mobile — CORRIGÉ (lot responsive du 10/7/2026)
**Problème.** `Layout.jsx` : marque + 4 onglets + bulle profil sur une seule ligne → débordait sous
~700px, poussant TOUTE la page hors écran (cause racine du décalage horizontal de Coaches/Settings).
**Solution appliquée.** Sous `md:`, les onglets inline + la bulle profil sont masqués (`hidden md:flex`)
au profit d'un bouton burger (`md:hidden`) qui ouvre un panneau déroulant avec les 4 liens + un bouton
"Changer de profil (Prénom)". Au-dessus de `md`, comportement inchangé.

### 7. ✅ Tableaux non scrollables sur mobile — CORRIGÉ (lot responsive du 10/7/2026)
**Problème.** Les grilles (Planning cours, Planning personnel, récap Coaches, tables Settings)
débordaient sans scroll horizontal → cellules tassées et illisibles ("impilotable" sur téléphone).
**Solution appliquée.** Chaque `<table>` large est enveloppée dans `overflow-x-auto` avec un `min-w-[…]`
donnant à chaque colonne une largeur lisible (le tableau scrolle horizontalement au lieu de s'écraser).
La 1re colonne reste en `sticky left-0` pour garder le contexte (jour/employé/coach). Le conflit
sticky-thead ↔ overflow est résolu en passant les en-têtes de `sticky top-14` à `static md:sticky
md:top-14` : pas de sticky vertical sur mobile (où il casserait), conservé sur desktop. Les grilles
KPI de Coaches passent de `grid-cols-3`/`grid-cols-2` à empilées sur mobile.
**Fichiers.** `Layout.jsx`, `Planning.jsx`, `PlanningPersonnel.jsx`, `Coaches.jsx`, `Settings.jsx`.
Vérifié par captures d'écran à 390px (mobile) et 1280px (desktop, aucune régression du sticky).

**Note :** approche volontairement robuste (scroll horizontal + colonnes larges), pas une refonte
mobile par jour/par employé. Si un jour on veut une vue "un jour à la fois" sur téléphone, c'est un
chantier séparé — le scroll horizontal actuel est déjà lisible et sans bug.

---

## P2 — Fonctionnalités à forte valeur métier

### 8. ✅ Dupliquer la semaine précédente (planning personnel) — CORRIGÉ
Le planning du personnel se répète largement d'une semaine à l'autre (c'était visible dans le PDF
source). **Solution appliquée.** Route `POST /api/personnel-creneaux/dupliquer`
`{ semaine_source, semaine_cible }` (`server/src/routes/personnelCreneaux.js`) qui regroupe les
créneaux source par employé + jour puis copie chaque jour en **sautant** ceux déjà renseignés dans
la cible (réutilise `upsertJour` de `personnelWrite.js`). Bouton "⧉ Dupliquer la semaine précédente"
toujours visible dans l'en-tête de `PlanningPersonnel.jsx` (pas seulement semaine vide), avec message
de résultat ("X jour(s) copié(s), Y déjà renseigné(s) conservé(s)"). Vérifié en local : un jour vide
est bien copié, un jour déjà rempli (test avec une valeur "FÉRIÉ" volontairement différente) reste
inchangé après duplication.

### 9. Impression de la semaine avec colonnes signatures
La salle imprimait le planning pour signature (colonnes "Signature du salarié / du responsable" dans
le PDF d'origine). Ajouter un bouton "Imprimer" sur Planning personnel + une feuille `@media print`
qui masque navbar/sidebar/boutons et ajoute deux colonnes vides "Signature salarié" / "Signature
responsable" à droite du tableau (visibles uniquement à l'impression, via classes `hidden print:table-cell`).
Ça remplace le processus papier existant. **Fichiers.** `PlanningPersonnel.jsx`, `client/src/index.css`.
**Effort M.**

### 10. ✅ Sauvegarde de la base en un clic — CORRIGÉ
La DB de prod est un unique fichier SQLite sur un volume Railway, sans sauvegarde. **Solution
appliquée.** `GET /api/admin/backup` (`requireManager`) exécute `PRAGMA wal_checkpoint(TRUNCATE)`
puis `res.download(DB_PATH, 'fitnessmov-YYYY-MM-DD.db')`. Côté client, `api.downloadBackup()` fait un
fetch+blob (le token Bearer ne peut pas passer par un simple `<a href>`) et déclenche le téléchargement.
Bouton "⬇ Télécharger une sauvegarde" dans Paramètres > Utilisateurs. Vérifié en local : fichier `.db`
téléchargé valide (reconnu comme base SQLite), taille et compteur de fichier identiques à la base
source au moment du téléchargement.

### 11. ✅ Récap mensuel des heures du personnel (aide paie) — CORRIGÉ
Équivalent du récap coachs mais pour les employés. **Solution appliquée.**
`GET /api/personnel-creneaux/recap?debut&fin` (`personnelCreneaux.js`) : agrège en JS (les colonnes
`debut`/`fin` sont des heures `HH:MM` sans date, pas exploitables par `strftime` SQL) le total
d'heures `travail` et le nombre de jours `cp` par employé et par mois, sur 12 mois. Manager : tout le
monde ; sinon : soi-même uniquement. Bouton "📊 Récap mensuel" dans `PlanningPersonnel.jsx` (visible
manager uniquement) qui bascule la vue hebdo vers ce tableau (mois en colonnes, employés en lignes,
triés par total décroissant, profils inactifs grisés). Vérifié en local avec des données réelles.

### 12. ✅ Déplacer une séance de cours (champ date manquant) — CORRIGÉ
Le `PATCH /api/seances/:id` acceptait déjà `date`, mais `SeanceModal.jsx` n'avait pas de champ date →
impossible de déplacer une séance sans la supprimer/recréer. **Solution appliquée.**
`<input type="date">` ajouté dans le formulaire, uniquement en mode édition (pas à la création, où
la date vient de la cellule cliquée). Vérifié en local : une séance du jeudi 9 déplacée au samedi 11
disparaît bien de jeudi et apparaît sur samedi après enregistrement.

### 13. ✅ Compteur de CP par année — CORRIGÉ
`GET /api/personnel-creneaux/cp-summary` additionnait tout l'historique — or les CP se comptent par
année. **Solution appliquée.** Paramètre `?annee=2026` (défaut : année en cours) avec
`WHERE strftime('%Y', pc.date) = ?`, sélecteur d'année (‹ / ›, année suivante désactivée si future)
ajouté dans `CpSummary` (`PlanningPersonnel.jsx`). Vérifié en local : les totaux changent bien en
changeant d'année (ex. Selim : 23 CP en 2026, 17 en 2025).

### 14. Férié pour tous en un clic *(idée écartée par l'utilisateur le 9/7 — ne faire que sur demande)*
Version simple si redemandée : au clic sur l'en-tête d'un jour, petit menu "Marquer férié pour tous"
qui upsert `type=ferie` pour chaque profil actif n'ayant rien ce jour-là. **Effort S/M.**

---

## P3 — Confort, polish, dette

### 15. ✅ Toasts d'erreur/succès — CORRIGÉ
**Solution appliquée.** `client/src/context/ToastContext.jsx` maison (pas de lib) : `ToastProvider` au
sommet de `App.jsx`, hook `useToast()` exposant `success/error/info`, affichage bas-droite, auto-dismiss
4s, clic pour fermer, animation `fadeIn` (keyframe dans `index.css`). Branché sur les sauvegardes/
suppressions explicites (séances, créneaux personnel, profils, sauvegarde DB, duplications) — pas sur
les micro-actions type clic de statut/effectif (trop bruyant). Vérifié : toast "✓ Créneau enregistré".

### 16. ✅ Indicateur de notes — CORRIGÉ
**Solution appliquée.** Un 📝 discret apparaît en coin quand `notes` est non vide : sur `SeanceCard.jsx`
(à côté de l'horaire) et sur les cellules de `PlanningPersonnel.jsx` (coin haut-droit), avec
`title={notes}` pour lecture au survol. Vérifié en local.

### 17. ✅ Effectif au-delà de 30 — CORRIGÉ
**Solution appliquée.** `HeadcountPopover.jsx` : sous la grille 1-30, un mini input "Autre…" + bouton OK
(validé aussi par Entrée) accepte n'importe quel nombre. Vérifié : saisir 45 enregistre bien
`nb_presents=45` et passe la séance à « Effectué ».

### 18. ✅ Couleur d'avatar incohérente dans "Mon profil" — CORRIGÉ
`Settings.jsx` (onglet Mon profil) utilisait `#2fa8cc` en dur au lieu de `colorForUser(me.id)`
(importable depuis `client/src/lib/utils.js`) — la bulle n'avait pas la même couleur que dans le
header et l'écran d'accueil. Corrigé et vérifié par capture d'écran (les deux bulles sont identiques).

### 19. ✅ Historique plus lisible — CORRIGÉ
**Solution appliquée.** `Settings.jsx` : `ACTION_LABELS` mappe les codes vers des libellés français
("Connexion au profil", "Séance modifiée", …) et `prettyDetails()` traduit les valeurs brutes du champ
détails (`effectue`→Effectué, `nb_presents`→présents, etc.). Pagination : route `/audit` passe à
`?limit&offset` (`server/src/routes/appUsers.js`), le client charge 50 lignes puis un bouton
"Charger plus" appen­d les suivantes. Vérifié en local. **Non fait** (jugé superflu) : filtre par type
d'action — à ajouter seulement si l'historique devient volumineux et pénible à parcourir.

### 20. ✅ PWA installable — CORRIGÉ
**Solution appliquée.** `client/public/manifest.json` (name "Planning Fitnessmov", `display: standalone`,
`theme_color: #0369a1`, icônes `/logo.png`) + `<link rel="manifest">`, `theme-color`, balises
apple-touch/mobile-web-app dans `client/index.html`, et `<html lang="fr">`. L'app peut s'installer sur
l'écran d'accueil. Pas de service worker (pas d'offline pour l'instant, non nécessaire).

### 21. ✅ Accessibilité des boutons icônes — CORRIGÉ (partiel)
**Solution appliquée.** `aria-label` ajoutés sur : burger + bulle profil (`Layout.jsx`), ← / → de
navigation semaine (`Planning.jsx`, `PlanningPersonnel.jsx`), icône effectif + input Autre
(`HeadcountPopover.jsx`), × suppression séance (`SeanceCard.jsx`), 📝 indicateurs de note.
**Reste à faire si besoin** : piège de focus dans les modales (non bloquant, `autoFocus` déjà en place
sur les premiers champs).

### 22. ✅ Nettoyage de code mort — CORRIGÉ (partiel)
- ✅ `client/src/components/NouvelleSeanceModal.jsx` supprimé (jamais importé).
- ✅ Static `/uploads` retiré de `server/src/index.js` (dossier inexistant, aucune UI ne s'en sert).
- **Laissé volontairement** : dépendance `multer` + table `coach_documents` + tables `planning_recurrent`
  / `modifications_ponctuelles` — inertes, les retirer demanderait une migration DB pour peu de gain ;
  à faire seulement si on nettoie le schéma pour de nouvelles installations.
- Route `POST /api/admin/seed-personnel` : conservée (réutilisable), n'a plus de bouton — documenté ici.

### 23. Build de prod automatisé (optionnel)
Aujourd'hui le build client est commité dans `server/public/` (source d'oublis : la prod a déjà cassé
une fois pour ça). Alternative : configurer la commande de build Railway pour builder le client à
chaque déploiement (`npm ci && npm run build --workspace=client && node scripts/copy-dist.js`, script
de copie cross-platform à créer) et retirer `server/public` du repo (`.gitignore`). À ne faire que si
l'utilisateur est à l'aise avec la config Railway. **Effort M.**

### 24. ✅ Sélecteur de cours avec recherche + ajout inline — CORRIGÉ
Le `<select>` de cours dans `SeanceModal.jsx` est remplacé par `CoursCombobox.jsx` : recherche
insensible aux accents/casse, résultats groupés par catégorie (Aqua/Fitness), et un bouton
« + Ajouter « {recherche} » en Aqua/Fitness » quand aucun cours ne correspond exactement — crée le
cours via `POST /api/cours-types` et le sélectionne immédiatement, sans recharger la page.

### 25. ✅ Import des données Ballancourt-sur-Essonne — CORRIGÉ
Import complet demandé explicitement par l'utilisateur (catalogue + historique complet) à partir de
`Planning_des_cours.xlsx` et `Planning_personnel_ballancourt.xlsx` :
- **Catalogue** : 12 cours propres à Ballancourt ajoutés à `coursCatalog.js` (Aquacircuit, 100% Attack,
  Body Sculpt, Fit Dance, Gym douce, MMA Conf, MMA Deb, Sprint 30, Stretching, Yoga, Initiation
  musculation, Workout) après comparaison insensible aux accents/casse/espaces avec le catalogue
  existant (ex. « body barre » → rattaché à l'existant « Bodybarre », pas dupliqué).
- **Coachs** : 23 coachs canonicalisés (fusion des variantes de casse/faute de frappe, ex.
  « wiliam »/« amine »/« imene » → William/Amine/Imane).
- **Séances** : 2412 séances historiques (`server/src/db/ballancourtSeances.js`), statut brut de la
  feuille mappé vers programme/effectué/annulé avec conservation du motif en note (Férié, Coach absent,
  Pas assez d'adhérents, etc). Pointeur non renseigné (colonne source ambiguë, ne contenait pas
  fiablement un nom de personne).
- **Planning personnel** : 1204 jours (9 employés) importés dans `personnel_creneaux`.
- Import réalisé via `server/src/db/seedBallancourt.js`, déclenché par un bouton manager discret dans
  Paramètres (visible uniquement quand `SALLE_NOM=Ballancourt-sur-Essonne`), idempotent (ne recrée
  jamais une séance ou un jour déjà présent).

---

## Idées écartées (ne pas implémenter sans demande explicite)
- Drag & drop des séances entre jours (gros chantier, faible demande).
- Vue mensuelle du planning personnel (le rythme de saisie est hebdomadaire).
- Multi-salles / multi-tenant (hors périmètre : outil interne).
- Champ "Code couleur" Ouverture/Milieu/Fermeture : implémenté puis retiré à la demande de
  l'utilisateur le 9/7/2026 — ne pas le réintroduire.
