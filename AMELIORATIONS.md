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

### 6. Navbar : débordement sur mobile — REPOUSSÉ (voir note ci-dessous)
**Problème.** `Layout.jsx` : marque + 4 onglets + bulle profil sur une seule ligne h-14 → déborde
sous ~700px, pas de menu burger.
**Solution.** Sous `md:` afficher un bouton burger qui ouvre les liens en panneau déroulant ; garder
la bulle profil visible. **Fichier.** `client/src/components/Layout.jsx`. **Effort M.**

### 7. Tableaux non scrollables sur mobile — REPOUSSÉ (voir note ci-dessous)
**Problème.** Les grilles (Planning cours, Planning personnel, récap Coaches 12 mois) débordent de
l'écran sans scroll horizontal propre.
**Solution.** Envelopper chaque `<table>` dans `<div className="overflow-x-auto">`. Attention :
les `sticky top-14` des thead ne fonctionnent plus dans un conteneur à overflow — accepter ce
compromis sur mobile seulement, ou passer les th en `sticky left-0` pour la 1re colonne uniquement.
**Fichiers.** `Planning.jsx`, `PlanningPersonnel.jsx`, `Coaches.jsx`. **Effort S/M.**

**Note du 9/7/2026 :** l'utilisateur a testé sur mobile (largeur réduite) et confirmé que l'app est
globalement "impilotable" sur petit écran, pas seulement la navbar/les tableaux pris isolément
(texte minuscule, colonnes tassées, cellules illisibles). Décision : ne pas corriger la navbar et
les tableaux séparément — traiter tout le responsive mobile en un seul lot dédié, à la fin, une fois
les autres points de cette liste traités. Ne pas reprendre les points 6/7 isolément sans redemande.

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

### 15. Toasts d'erreur/succès
Beaucoup d'appels ont des `.catch(() => {})` silencieux (chargement profils, créneaux, CP…). Créer un
mini `ToastContext` maison (pas de lib) : provider dans `App.jsx`, hook `useToast()`, affichage en
bas à droite, auto-dismiss 4s. Brancher au minimum sur les échecs de sauvegarde. **Effort M.**

### 16. Indicateur de notes
Une séance ou un jour de personnel qui a des `notes` n'a aucun signe distinctif. Ajouter un petit
point/📝 en coin de `SeanceCard.jsx` et des cellules de `PlanningPersonnel.jsx` quand `notes` est
non vide, avec `title={notes}` pour lecture au survol. **Effort S.**

### 17. Effectif au-delà de 30
`HeadcountPopover.jsx` plafonne à 30. Ajouter sous la grille un mini input numérique "Autre : __"
validé par Entrée. **Effort S.**

### 18. ✅ Couleur d'avatar incohérente dans "Mon profil" — CORRIGÉ
`Settings.jsx` (onglet Mon profil) utilisait `#2fa8cc` en dur au lieu de `colorForUser(me.id)`
(importable depuis `client/src/lib/utils.js`) — la bulle n'avait pas la même couleur que dans le
header et l'écran d'accueil. Corrigé et vérifié par capture d'écran (les deux bulles sont identiques).

### 19. Historique plus lisible
L'onglet Historique affiche les actions brutes (`switch_profile`, `update_seance`,
`statut=effectue, nb_presents=12`). Mapper vers des libellés français ("Connexion au profil",
"Séance modifiée — statut : Effectué, 12 présents"), ajouter un filtre par type d'action et une
pagination (le serveur limite à 200 : passer à `?limit&offset`). **Fichiers.** `Settings.jsx`,
`server/src/routes/appUsers.js` (route `/audit`). **Effort M.**

### 20. PWA installable
Le staff utilise des téléphones : ajouter `client/public/manifest.json` (name "Planning Fitnessmov",
icônes depuis `client/public/logo.png` 1080×1080 déjà présent, `display: standalone`,
`theme_color: #0369a1`) + `<link rel="manifest">` dans `client/index.html`. L'app s'installe alors
sur l'écran d'accueil comme une vraie app. Pas besoin de service worker pour commencer. **Effort S.**

### 21. Accessibilité des modales et boutons icônes
Ajouter `aria-label` sur les boutons ×, +, ←, →, la bulle profil du header ; piéger le focus dans
les modales (ou au minimum `autoFocus` sur le premier champ, déjà fait dans AddProfileModal).
**Effort M.**

### 22. Nettoyage de code mort
- `client/src/components/NouvelleSeanceModal.jsx` : jamais importé → supprimer.
- Tables `planning_recurrent`, `modifications_ponctuelles` : aucune route ne les utilise → laisser en
  base (données inoffensives) mais ne pas construire dessus ; ou les supprimer du schéma pour les
  nouvelles installations.
- `coach_documents` + multer + `/uploads` : aucune UI ne s'en sert → si confirmé inutile, retirer la
  dépendance `multer` (vulnérabilités connues en 1.x) et le static `/uploads`.
- Route `POST /api/admin/seed-personnel` : conserver (réutilisable), mais elle n'a plus de bouton — documenter.
**Effort S.**

### 23. Build de prod automatisé (optionnel)
Aujourd'hui le build client est commité dans `server/public/` (source d'oublis : la prod a déjà cassé
une fois pour ça). Alternative : configurer la commande de build Railway pour builder le client à
chaque déploiement (`npm ci && npm run build --workspace=client && node scripts/copy-dist.js`, script
de copie cross-platform à créer) et retirer `server/public` du repo (`.gitignore`). À ne faire que si
l'utilisateur est à l'aise avec la config Railway. **Effort M.**

---

## Idées écartées (ne pas implémenter sans demande explicite)
- Drag & drop des séances entre jours (gros chantier, faible demande).
- Vue mensuelle du planning personnel (le rythme de saisie est hebdomadaire).
- Multi-salles / multi-tenant (hors périmètre : outil interne).
- Champ "Code couleur" Ouverture/Milieu/Fermeture : implémenté puis retiré à la demande de
  l'utilisateur le 9/7/2026 — ne pas le réintroduire.
