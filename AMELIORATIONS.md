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

### 3. Session expirée : l'app reste affichée et toutes les actions échouent en silence
**Problème.** Après l'expiration du matin, si l'onglet était resté ouvert, chaque clic provoque une
erreur "Session expirée" mais l'utilisateur reste sur la page (le `catch` avale souvent l'erreur).
**Solution.** Dans `client/src/lib/api.js`, fonction `req()` : si `res.status === 401`, faire
`localStorage.removeItem('fm_token'); window.location.assign('/login');` avant de throw. C'est le
filet de sécurité global ; pas besoin de toucher chaque page. **Effort S.**

### 4. Seed des cours : 19 cours sur 27 silencieusement perdus sur une installation neuve
**Problème.** `server/src/db/seed.js` insère des catégories `bike` et `salle`, mais la contrainte
`CHECK(categorie IN ('aqua','fitness'))` de `cours_types` + `INSERT OR IGNORE` fait que ces lignes
sont ignorées sans erreur. La prod n'est pas touchée (ses données existaient avant), mais toute
nouvelle installation n'aura que les 8 cours aqua.
**Solution.** Dans `seed.js`, remplacer `bike` et `salle` par `fitness` (l'UI ne connaît que
aqua/fitness : `CATEGORIE_CONFIG` dans `client/src/lib/utils.js`, lignes `ROWS` de `Planning.jsx`).
**Effort S.**

### 5. Le "✕" du sélecteur de pointeur SUPPRIME le pointeur de la base
**Problème.** Dans `SeanceModal.jsx` (`PointeurSelector`), le bouton ✕ à côté du select ressemble à
"désélectionner" mais appelle `api.deletePointeur(id)` → suppression définitive pour tout le monde.
**Solution.** Le ✕ ne doit que vider la sélection (`onChange('')`). Pour la vraie suppression, ajouter
un `confirm()` explicite ("Supprimer définitivement le pointeur X ?") ou déplacer la gestion des
pointeurs dans Paramètres. **Fichier.** `client/src/components/SeanceModal.jsx`. **Effort S.**

### 6. Navbar : débordement sur mobile
**Problème.** `Layout.jsx` : marque + 4 onglets + bulle profil sur une seule ligne h-14 → déborde
sous ~700px, pas de menu burger.
**Solution.** Sous `md:` afficher un bouton burger qui ouvre les liens en panneau déroulant ; garder
la bulle profil visible. **Fichier.** `client/src/components/Layout.jsx`. **Effort M.**

### 7. Tableaux non scrollables sur mobile
**Problème.** Les grilles (Planning cours, Planning personnel, récap Coaches 12 mois) débordent de
l'écran sans scroll horizontal propre.
**Solution.** Envelopper chaque `<table>` dans `<div className="overflow-x-auto">`. Attention :
les `sticky top-14` des thead ne fonctionnent plus dans un conteneur à overflow — accepter ce
compromis sur mobile seulement, ou passer les th en `sticky left-0` pour la 1re colonne uniquement.
**Fichiers.** `Planning.jsx`, `PlanningPersonnel.jsx`, `Coaches.jsx`. **Effort S/M.**

---

## P2 — Fonctionnalités à forte valeur métier

### 8. Dupliquer la semaine précédente (planning personnel)
Le planning du personnel se répète largement d'une semaine à l'autre (c'était visible dans le PDF
source). Même mécanique que pour les cours : route `POST /api/personnel-creneaux/dupliquer`
`{ semaine_source, semaine_cible }` qui copie tous les jours de tous les employés en **sautant** les
jours déjà renseignés dans la cible (réutiliser `upsertJour` de `server/src/db/personnelWrite.js` et
le calcul de décalage de dates de `seances.js /dupliquer`). Bouton "⧉ Dupliquer la semaine précédente"
dans la barre d'en-tête de `PlanningPersonnel.jsx` (pas seulement quand la semaine est vide : proposer
toujours, puisque les jours remplis sont préservés). **Effort M. Très gros gain de saisie.**

### 9. Impression de la semaine avec colonnes signatures
La salle imprimait le planning pour signature (colonnes "Signature du salarié / du responsable" dans
le PDF d'origine). Ajouter un bouton "Imprimer" sur Planning personnel + une feuille `@media print`
qui masque navbar/sidebar/boutons et ajoute deux colonnes vides "Signature salarié" / "Signature
responsable" à droite du tableau (visibles uniquement à l'impression, via classes `hidden print:table-cell`).
Ça remplace le processus papier existant. **Fichiers.** `PlanningPersonnel.jsx`, `client/src/index.css`.
**Effort M.**

### 10. Sauvegarde de la base en un clic
La DB de prod est un unique fichier SQLite sur un volume Railway, sans sauvegarde. Ajouter
`GET /api/admin/backup` (manager, `requireManager`) qui renvoie le fichier :
`res.download(DB_PATH, 'fitnessmov-YYYY-MM-DD.db')` — attention à utiliser la même résolution de
chemin que `database.js` (`process.env.DB_PATH || …`). Bouton "Télécharger une sauvegarde" dans
Paramètres (onglet Utilisateurs ou un nouvel onglet "Maintenance"). Comme WAL est actif, exécuter
`db.run('PRAGMA wal_checkpoint(TRUNCATE)')` juste avant l'envoi pour que le fichier soit complet.
**Fichiers.** `server/src/routes/admin.js`, `client/src/lib/api.js` (lien direct `<a href>` avec token
en query ou fetch+blob), `Settings.jsx`. **Effort S/M.**

### 11. Récap mensuel des heures du personnel (aide paie)
Équivalent du récap coachs mais pour les employés : total d'heures `travail` par employé par mois
(+ nb de jours CP par mois). Route `GET /api/personnel-creneaux/recap?debut&fin` avec
`SUM((strftime('%s', fin) - strftime('%s', debut))/60)` groupé par employé/mois — ou plus simple,
calculer en JS après un SELECT brut. Affichage : section sous le tableau hebdo ou onglet dédié.
**Effort M.**

### 12. Déplacer une séance de cours (champ date manquant)
Le `PATCH /api/seances/:id` accepte déjà `date`, mais `SeanceModal.jsx` n'a pas de champ date →
impossible de déplacer une séance sans la supprimer/recréer. Ajouter `<input type="date">` dans le
formulaire (pré-rempli avec `seance.date`). **Effort S.**

### 13. Compteur de CP par année
`GET /api/personnel-creneaux/cp-summary` additionne tout l'historique — or les CP se comptent par
année. Ajouter un paramètre `?annee=2026` (défaut : année en cours) avec
`WHERE strftime('%Y', pc.date) = ?`, et un petit sélecteur d'année dans le composant `CpSummary`
de `PlanningPersonnel.jsx`. **Effort S.**

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

### 18. Couleur d'avatar incohérente dans "Mon profil"
`Settings.jsx` (onglet Mon profil) utilise `#2fa8cc` en dur au lieu de `colorForUser(me.id)`
(importable depuis `client/src/lib/utils.js`) — la bulle n'a pas la même couleur que dans le header
et l'écran d'accueil. **Effort S.**

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
