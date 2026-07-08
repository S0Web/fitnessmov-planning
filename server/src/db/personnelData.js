// Données transcrites depuis "Planning du personnel - août 2025 à août 2026".
// Format par semaine : { lundi: 'YYYY-MM-DD', employes: { Nom: [lun,mar,mer,jeu,ven,sam,dim] } }
// Valeur de jour : '' (aucune donnée), 'CP'|'ECOLE'|'FERIE'|'ARRET'|'ABSENT'|'X' (code),
// ou "debut-fin" (un créneau) / "debut1-fin1,debut2-fin2" (coupure).
module.exports = [
  // ── Août 2025 ──────────────────────────────────────────────────────────────
  { lundi: '2025-08-04', employes: {
    Maxime: ['15h-22h','15h-22h','15h-22h','15h-22h','15h-22h','X','X'],
    Ameur:  ['CP','CP','CP','CP','CP','X','X'],
    Mathis: ['CP','CP','CP','CP','CP','X','X'],
    Selim:  ['7h30-12h30,18h15-20h15','7h30-12h30','7h30-13h30,19h-20h','7h30-12h30,18h15-20h15','18h15-20h15','9h30-12h30','10h-14h'],
  }},
  { lundi: '2025-08-11', employes: {
    Maxime: ['7h30-14h30','CP','CP','CP','FERIE','X','X'],
    Ameur:  ['15h-22h','15h-22h','15h-22h','15h-22h','FERIE','X','X'],
    Mathis: ['CP','CP','CP','CP','FERIE','X','X'],
    Selim:  ['ECOLE','CP','CP','ECOLE','FERIE','9h30-12h30','10h-12h'],
  }},
  { lundi: '2025-08-18', employes: {
    Maxime: ['CP','CP','CP','CP','CP','X','X'],
    Ameur:  ['15h-22h','15h-22h','15h-22h','CP','X','9h-18h','X'],
    Mathis: ['7h30-14h30','7h30-14h30','7h30-14h30','7h30-14h30','7h30-14h30','X','X'],
    Selim:  ['ECOLE','CP','CP','ECOLE','CP','9h30-12h30',''],
  }},
  { lundi: '2025-08-25', employes: {
    Maxime: ['15h-22h','15h-22h','15h-22h','15h-22h','15h-22h','X','X'],
    Ameur:  ['CP','CP','CP','CP','CP','X','X'],
    Mathis: ['7h30-14h30','ECOLE','7h30-14h30','7h30-14h30','7h30-14h30','X','X'],
    Selim:  ['ECOLE','CP','CP','ECOLE','CP','X','X'],
  }},

  // ── Septembre 2025 ─────────────────────────────────────────────────────────
  { lundi: '2025-09-01', employes: {
    Mohammed: ['X','X','X','15h-22h','15h-22h','11h-18h','11h-18h'],
    Rudy:     ['7h30-10h30,18h-22h','7h30-14h30','11h30-14h30,18h-22h','7h30-14h30','12h30-19h30','X','X'],
    Serena:   ['X','X','X','X','X','X','X'],
    Selim:    ['ECOLE','CP','CP','ECOLE','7h30-12h30','X','10h-12h'],
  }},
  { lundi: '2025-09-08', employes: {
    Mohammed: ['15h-22h','ECOLE','7h30-14h30','7h30-14h30','7h30-10h30,18h-22h','X','X'],
    Rudy:     ['7h30-10h30,18h-22h','7h30-14h30','X','15h-22h','ECOLE','11h-18h','X'],
    Serena:   ['7h30-14h30','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:    ['ECOLE','10h-11h30,16h-22h','15h-22h','ECOLE','ECOLE','X','10h-12h'],
  }},
  { lundi: '2025-09-15', employes: {
    Mohammed: ['7h30-10h30,18h-22h','7h30-10h30,18h-22h','7h30-10h30,18h-22h','7h30-10h30,18h-22h','7h30-10h30,18h-22h','X','X'],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','11h-18h','X'],
    Serena:   ['7h30-14h30','7h30-14h30','7h30-14h30','ECOLE','ECOLE','X','X'],
    Selim:    ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','10h-12h'],
  }},
  { lundi: '2025-09-22', employes: {
    Mohammed: ['7h30-14h30','7h30-14h30','7h30-14h30','13h-20h','X','X','11h-18h'],
    Rudy:     ['15h-22h','X','X','15h-22h','15h-22h','11h-18h','X'],
    Serena:   ['8h-15h','13h-20h','9h-16h','ECOLE','ECOLE','X','X'],
    Selim:    ['15h-22h','9h-12h,18h-22h','16h-22h','7h30-13h30','7h30-14h30','X','10h-12h'],
  }},

  // ── Octobre 2025 ───────────────────────────────────────────────────────────
  { lundi: '2025-09-29', employes: {
    Mohammed: ['7h30-14h30','ECOLE','15h-22h','11h-18h','15h-22h','',''],
    Rudy:     ['15h-22h','15h-22h','7h30-14h30','15h-22h','11h-18h','',''],
    Serena:   ['','13h-20h','7h30-14h30','ECOLE','ECOLE','','11h-18h'],
    Selim:    ['9h-12h,18h-22h','7h30-14h30','17h-22h','9h30-12h30,18h-22h','7h30-14h30','10h-12h',''],
  }},
  { lundi: '2025-10-06', employes: {
    Mohammed: ['7h30-14h30','ECOLE','11h-18h','15h-22h','15h-22h','',''],
    Rudy:     ['15h-22h','15h-22h','15h-22h','7h30-14h30','9h30-12h30','14h-18h',''],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','',''],
    Selim:    ['9h-12h,18h-22h','7h30-14h30','7h30-12h30','9h30-12h30,18h-22h','7h30-14h30','10h-12h',''],
  }},
  { lundi: '2025-10-13', employes: {
    Mohammed: ['7h30-14h30','ECOLE','15h-22h','9h-16h','11h-18h','',''],
    Rudy:     ['15h-22h','15h-22h','7h30-14h30','15h-22h','11h-18h','',''],
    Serena:   ['8h-15h','13h-20h','8h-15h','ECOLE','ECOLE','10h-17h',''],
    Selim:    ['15h-22h','7h30-14h30','7h30-12h30','9h30-12h30,18h-22h','7h30-14h30','10h-12h',''],
  }},
  { lundi: '2025-10-20', employes: {
    Mohammed: ['15h-22h','ECOLE','7h30-9h30,16h45-22h','7h30-10h30,18h-22h','7h30-10h30,18h-22h','',''],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','11h-18h',''],
    Serena:   ['7h30-14h30','13h-20h','7h30-14h30','ECOLE','ECOLE','',''],
    Selim:    ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','9h30-12h30',''],
  }},
  { lundi: '2025-10-27', employes: {
    Mohammed: ['7h30-9h30,17h-22h','ECOLE','15h-22h','7h30-14h30','FERIE','11h-18h',''],
    Rudy:     ['15h-22h','15h-22h','7h30-14h30','15h-22h','FERIE','',''],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','FERIE','',''],
    Selim:    ['9h30-14h30,18h15-20h15','7h30-11h30,18h30-20h30','7h30-14h30','9h30-12h30,18h-22h','9h30-11h30','FERIE','10h-13h'],
  }},

  // ── Novembre 2025 ──────────────────────────────────────────────────────────
  { lundi: '2025-11-03', employes: {
    Mohammed: ['7h30-10h30,18h-22h','ECOLE','7h30-10h30,18h-22h','7h30-10h30,18h-22h','7h30-10h30,18h-22h','X','X'],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:    ['18h-20h','9h30-11h30,18h30-20h30','ECOLE','ECOLE','9h30-12h30','X','9h30-11h30'],
    Bryan:    ['9h30-11h','18h-19h','','9h30-11h,18h-19h','9h30-11h','X','10h-12h'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2025-11-10', employes: {
    Mohammed: ['X','FERIE','7h30-14h30','9h-16h','15h-22h','X','11h-18h'],
    Rudy:     ['15h-22h','FERIE','X','15h-22h','X','11h-18h','X'],
    Serena:   ['7h30-14h30','FERIE','X','ECOLE','ECOLE','X','X'],
    Selim:    ['13h-20h','FERIE','10h-22h','7h30-13h30','7h30-14h30','X','9h30-12h30'],
    Bryan:    ['X','FERIE','X','9h30-11h,18h-19h','9h30-11h','X','10h-12h'],
    Myriam:   ['16h30-20h30','FERIE','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2025-11-17', employes: {
    Mohammed: ['X','ECOLE','7h30-14h30','9h-16h','15h-22h','11h-18h','X'],
    Rudy:     ['15h-22h','15h-22h','X','15h-22h','13h-20h','X','11h-18h'],
    Serena:   ['7h30-14h30','13h-20h','9h-16h','ECOLE','ECOLE','X','X'],
    Selim:    ['15h-20h','7h30-14h30','10h-13h,16h-22h','7h30-13h30','7h30-12h30','X','9h30-12h30'],
    Bryan:    ['X','X','X','9h30-11h,18h-19h','9h30-11h,18h-19h','X','10h-12h'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2025-11-24', employes: {
    Mohammed: ['7h30-10h30,18h-22h','ECOLE','7h30-10h30,18h-22h','7h30-10h30,18h-22h','7h30-10h30,18h-22h','X','X'],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:    ['18h30-20h30','18h30-20h30','ECOLE','ECOLE','ECOLE','X','9h30-11h30'],
    Bryan:    ['9h30-11h','9h30-11h,18h-19h','X','9h30-11h,18h-19h','9h30-11h','X','10h-12h'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},

  // ── Décembre 2025 ──────────────────────────────────────────────────────────
  { lundi: '2025-12-01', employes: {
    Mohammed: ['X','ECOLE','7h30-14h30','7h30-14h30','15h-22h','X','11h-18h'],
    Rudy:     ['15h-22h','15h-22h','X','15h-22h','7h30-14h30','11h-18h','X'],
    Serena:   ['7h30-14h30','13h30-20h30','10h-17h','ECOLE','ECOLE','X','X'],
    Selim:    ['8h-15h,18h-20h','7h30-13h30,18h30-20h30','10h30-12h30,18h-22h','9h30-12h30,18h15-20h15','9h30-14h30','X','9h30-11h30'],
    Bryan:    ['X','19h-20h','X','9h30-11h,19h-20h','9h30-11h','X','10h-12h'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2025-12-08', employes: {
    Mohammed: ['7h30-9h30,17h-22h','ECOLE','7h30-9h30,17h-22h','7h30-9h30,17h-22h','7h30-9h30,17h-22h','',''],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','',''],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','',''],
    Selim:    ['18h30-20h30','18h30-20h30','ECOLE','18h15-20h15','9h30-12h30','9h30-11h30',''],
    Bryan:    ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','10h-12h'],
    Myriam:   ['9h-13h','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2025-12-15', employes: {
    Mohammed: ['X','17h-22h','7h30-14h30','7h30-14h30','15h-22h','9h-13h','13h-18h'],
    Rudy:     ['15h-22h','ARRET','ARRET','ARRET','ARRET','X','X'],
    Serena:   ['7h30-14h30','13h30-20h30','9h30-16h30','ECOLE','ECOLE','X','X'],
    Selim:    ['9h-16h,18h-20h','7h30-13h30,18h30-20h30','10h30-12h30,18h-22h','9h30-12h30,15h-22h','7h30-14h30','13h-18h','9h-13h'],
    Bryan:    ['X','X','X','9h30-11h,19h-20h','9h30-11h','X','10h-12h'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2025-12-22', employes: {
    Mohammed: ['7h30-14h30','ECOLE','X','FERIE','7h30-9h30,17h-22h','11h-18h','X'],
    Rudy:     ['ARRET','ARRET','ARRET','FERIE','ARRET','X','X'],
    Serena:   ['CP','CP','CP','FERIE','CP','X','X'],
    Selim:    ['CP','CP','CP','FERIE','CP','X','X'],
    Bryan:    ['9h30-11h','9h30-11h,19h-20h','X','FERIE','9h30-11h','X','10h-12h'],
    Myriam:   ['16h30-20h30','X','X','X','X','X','X'],
  }},
  { lundi: '2025-12-29', employes: {
    Mohammed: ['15h-22h','ECOLE','11h-18h','FERIE','7h30-14h30','X','X'],
    Rudy:     ['ARRET','ARRET','ARRET','FERIE','ARRET','X','X'],
    Serena:   ['7h30-14h30','7h30-14h30','CP','FERIE','CP','X','X'],
    Selim:    ['CP','CP','CP','FERIE','CP','X','X'],
    Myriam:   ['16h30-20h30','X','X','FERIE','X','X','X'],
    Bryan:    ['X','9h30-11h,19h-20h','X','FERIE','9h30-11h','X','10h-12h'],
  }},

  // ── Janvier 2026 ───────────────────────────────────────────────────────────
  { lundi: '2026-01-05', employes: {
    Mohammed: ['7h30-9h30,17h-22h','ECOLE','7h30-9h30,17h-22h','7h30-9h30,17h-22h','7h30-9h30,17h-22h','X','X'],
    Rudy:     ['ARRET','ARRET','ECOLE','ECOLE','ECOLE','X','X'],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:    ['ECOLE','18h30-20h30','ECOLE','18h15-20h15','ECOLE','X','9h30-12h30'],
    Bryan:    ['9h30-11h','9h30-11h,19h-20h','X','9h30-11h','9h30-11h,19h-20h','X','10h-12h'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2026-01-12', employes: {
    Mohammed: ['X','ECOLE','CP','7h30-14h30','15h-22h','X','11h-18h'],
    Rudy:     ['15h-22h','15h-22h','15h-22h','15h-22h','X','11h-18h','X'],
    Serena:   ['7h30-14h30','13h-20h','9h-16h','13h-20h','9h-16h','X','X'],
    Selim:    ['CP','7h30-12h30,18h30-20h30','7h30-14h30','9h30-12h30,18h15-20h15','7h30-14h30','X','9h30-11h30'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
    Bryan:    ['9h30-11h','X','X','9h30-11h','9h30-11h','X','10h-12h'],
  }},
  { lundi: '2026-01-19', employes: {
    Mohammed: ['X','ECOLE','7h30-9h30,17h-22h','7h30-14h30','15h-22h','X','11h-18h'],
    Rudy:     ['15h-22h','15h-22h','CP','15h-22h','X','11h-18h','X'],
    Serena:   ['7h30-14h30','13h-20h','9h-16h','9h-16h','7h30-14h30','X','X'],
    Selim:    ['CP','7h30-12h30,18h30-20h30','10h-17h','9h30-12h30,18h15-20h15','9h-16h','X','9h30-11h30'],
    Myriam:   ['16h30-20h30','X','16h30-22h','19h-20h','X','X','X'],
    Bryan:    ['12h30-13h30','X','X','17h-18h','X','X','10h-12h'],
  }},
  { lundi: '2026-01-26', employes: {
    Mohammed: ['7h30-9h30,17h-22h','ECOLE','7h30-9h30,17h-22h','7h30-9h30,17h-22h','7h30-9h30,17h-22h','',''],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','',''],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','',''],
    Selim:    ['9h30-11h30','7h30-12h30,18h30-20h30','ECOLE','18h15-20h15','18h15-20h15','X','9h30-12h30'],
    Bryan:    ['X','X','X','X','X','X','X'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','19h-20h','X','X','X'],
  }},

  // ── Février 2026 ───────────────────────────────────────────────────────────
  { lundi: '2026-02-02', employes: {
    Mohammed: ['CP','CP','CP','CP','CP','X','X'],
    Rudy:     ['15h-22h','15h-22h','7h30-9h,16h30-22h','7h30-9h,16h30-22h','7h30-9h,16h30-22h','X','X'],
    Serena:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:    ['7h30-14h30','7h30-12h30,18h30-20h30','10h-13h,18h30-20h30','9h30-12h30,18h15-20h15','9h30-12h30,18h15-20h15','9h30-11h30','9h30-11h30'],
    Bryan:    ['X','X','X','X','X','X','X'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2026-02-09', employes: {
    Mohammed: ['CP','CP','CP','CP','CP','X','X'],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Serena:   ['7h30-14h30','7h30-14h30','7h30-14h30','7h30-14h30','7h30-14h30','X','X'],
    Selim:    ['ECOLE','9h30-11h,18h30-20h30','ECOLE','9h30-12h30,18h15-20h15','18h15-20h15','9h30-11h30','9h30-11h30'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2026-02-16', employes: {
    Mohammed: ['X','ECOLE','7h30-14h30','7h30-14h30','7h30-14h30','X','11h-18h'],
    Rudy:     ['15h-22h','15h-22h','X','15h-22h','15h-22h','11h-18h','X'],
    Selim:    ['7h30-14h30','7h30-12h30,18h30-20h30','15h-22h','9h30-12h30,18h15-20h15','9h30-12h30,18h15-20h15','X','9h30-13h30'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},
  { lundi: '2026-02-23', employes: {
    Mohammed: ['X','ECOLE','7h30-14h30','7h30-14h30','15h-22h','11h-18h','X'],
    Rudy:     ['15h-22h','15h-22h','15h-22h','15h-22h','X','X','11h-18h'],
    Selim:    ['ECOLE','18h30-20h30','10h30-12h30','18h15-20h15','9h30-12h30,18h30-20h30','X','9h30-12h30'],
    Myriam:   ['16h30-20h30','X','16h30-20h30','X','X','X','X'],
  }},

  // ── Mars 2026 ──────────────────────────────────────────────────────────────
  { lundi: '2026-03-02', employes: {
    Mohammed: ['15h-22h','ECOLE','15h-22h','15h-22h','15h-22h','X','X'],
    Rudy:     ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:    ['ECOLE','9h30-11h30,18h30-20h30','ECOLE','ECOLE','ECOLE','X','9h30-11h30'],
    Myriam:   ['9h30-11h,18h-20h','X','16h30-20h30','X','X','X','X'],
    Djamel:   ['7h30-14h30','7h30-22h','7h30-14h30','7h30-14h30','7h30-14h30','9h-18h','9h-18h'],
  }},
  { lundi: '2026-03-09', employes: {
    Mohammed: ['7h30-14h30','ECOLE','7h30-14h30','7h30-14h30','7h30-14h30','X','12h-18h'],
    Rudy:     ['15h-22h','15h-22h','15h-22h','15h-22h','15h-22h','X','X'],
    Selim:    ['X','7h30-15h,18h30-20h30','10h-15h','9h-15h,18h15-20h15','9h30-15h,18h15-20h15','X','9h30-14h30'],
    Myriam:   ['9h30-11h,18h-20h','X','16h30-20h30','16h30-20h30','X','X',''],
    Djamel:   ['7h30-14h30','X','X','X','X','X','X'],
  }},
  { lundi: '2026-03-16', employes: {
    Mohammed: ['7h30-14h30','ECOLE','','7h30-14h30','X','11h-18h','X'],
    Rudy:     ['15h-22h','15h-22h','15h-22h','15h-22h','15h-22h','X','X'],
    Selim:    ['X','7h30-15h,18h30-20h30','7h30-15h','9h-14h,18h-20h','9h30-15h,18h15-20h15','X','9h30-13h30'],
    Myriam:   ['9h30-11h,18h-20h','X','16h30-20h30','X','X','',''],
  }},
  { lundi: '2026-03-23', employes: {
    Mohammed: ['7h30-9h30,17h-22h','ECOLE','ARRET','7h30-14h30','15h-22h','X','X'],
    Rudy:     ['ECOLE','ECOLE','15h-22h','ECOLE','ECOLE','X','X'],
    Selim:    ['ECOLE','7h30-9h,18h-20h','10h30-12h30','9h30-12h30,18h-20h','9h30-12h30,18h-20h','X','9h30-11h30'],
    Myriam:   ['9h30-11h30,16h-20h','X','16h30-20h30','X','X','X','X'],
  }},

  // ── Avril 2026 ─────────────────────────────────────────────────────────────
  { lundi: '2026-03-30', employes: {
    Mohammed: ['7h30-14h30','ECOLE','7h30-9h,16h30-22h','7h30-9h,16h30-22h','7h30-9h,16h30-22h','X','X'],
    Rudy:     ['15h-22h','7h30-9h,16h30-22h','CP','CP','CP','X','X'],
    Selim:    ['CP','CP','CP','CP','CP','X','9h30-11h30'],
    Myriam:   ['9h30-12h30','X','X','18h15-20h15','18h15-20h15','X','X'],
  }},
  { lundi: '2026-04-06', employes: {
    Rudy:   ['FERIE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:  ['FERIE','ECOLE','ECOLE','ECOLE','ECOLE','X','9h30-11h30'],
    Myriam: ['FERIE','9h30-12h','X','16h30-20h30','16h30-20h30','X',''],
    Djamel: ['X','7h30-22h','7h30-22h','7h30-22h','7h30-22h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-04-13', employes: {
    Rudy:   ['14h30-22h','15h-22h','15h30-22h','15h-22h','15h-22h','X','X'],
    Selim:  ['7h30-14h30','7h30-11h,18h30-20h30','CP','7h30-12h30,18h30-20h30','9h30-11h30,18h30-20h30','X','9h30-11h30'],
    Myriam: ['X','X','X','X','X','X','X'],
    Djamel: ['X','X','7h30-15h','X','7h30-15h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-04-20', employes: {
    Rudy:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X',''],
    Selim:  ['ECOLE','18h30-20h30','ECOLE','ECOLE','ECOLE','9h30-12h30','9h30-11h30'],
    Myriam: ['9h30-12h','9h30-12h','X','18h15-20h15','18h15-20h15','X','X'],
    Djamel: ['7h30-22h','7h30-22h','7h30-22h','7h30-22h','7h30-22h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-04-27', employes: {
    Rudy:   ['15h-22h','15h-22h','15h-22h','15h-22h','FERIE','X',''],
    Selim:  ['7h30-14h30','7h30-14h30,18h30-20h30','7h30-14h30','7h30-14h30','FERIE','X','9h30-11h30'],
    Myriam: ['9h30-12h','9h30-12h','X','18h15-20h15','FERIE','X','X'],
    Djamel: ['ABSENT','ABSENT','ABSENT','ABSENT','ABSENT','9h-18h','9h-18h'],
  }},

  // ── Mai 2026 ───────────────────────────────────────────────────────────────
  { lundi: '2026-05-04', employes: {
    Rudy:   ['ECOLE','ECOLE','ECOLE','ECOLE','FERIE','X','X'],
    Selim:  ['ECOLE','18h30-20h30','ECOLE','ECOLE','FERIE','X','9h30-11h30'],
    Myriam: ['9h30-12h','9h30-12h','X','18h15-20h15','FERIE','X','X'],
    Djamel: ['7h30-22h','7h30-22h','7h30-22h','7h30-22h','9h-18h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-05-11', employes: {
    Rudy:   ['7h30-9h,16h30-22h','15h-22h','7h30-9h,16h30-22h','FERIE','7h30-9h,16h30-22h','X','X'],
    Selim:  ['CP','CP','CP','FERIE','CP','X','9h30-11h30'],
    Myriam: ['9h30-12h','9h30-12h','X','FERIE','18h15-20h15','X','X'],
    Djamel: ['9h-16h30','7h30-14h30','9h-16h30','9h-18h','9h-16h30','9h-18h','9h-18h'],
  }},
  { lundi: '2026-05-18', employes: {
    Rudy:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:  ['ECOLE','18h30-20h30','ECOLE','ECOLE','ECOLE','X','9h30-11h30'],
    Myriam: ['X','X','X','X','X','X','X'],
    Djamel: ['7h30-22h','7h30-22h','7h30-22h','7h30-22h','7h30-22h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-05-25', employes: {
    Abou:   ['11h-18h','15h-22h','X','15h-22h','15h-22h','X','X'],
    Selim:  ['FERIE','CP','CP','CP','CP','X','9h30-11h30'],
    Myriam: ['FERIE','7h30-11h','X','7h30-9h,18h15-20h15','18h15-20h15','X','X'],
    Djamel: ['9h-11h','9h-15h','9h-18h','9h-15h','7h30-15h','9h-18h','9h-18h'],
  }},

  // ── Juin 2026 ──────────────────────────────────────────────────────────────
  { lundi: '2026-06-01', employes: {
    Rudy:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:  ['ECOLE','18h30-20h30','ECOLE','ECOLE','ECOLE','X','9h30-11h30'],
    Myriam: ['7h30-11h,18h30-22h','7h30-11h,18h30-22h','X','7h30-9h,17h-22h','18h15-20h15','X','X'],
    Djamel: ['11h-19h','11h-19h','7h30-22h','9h-19h','7h30-22h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-06-08', employes: {
    Rudy:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:  ['ECOLE','18h30-20h30','ECOLE','ECOLE','ECOLE','X','9h30-11h30'],
    Myriam: ['7h30-11h,18h30-22h','7h30-11h,18h30-22h','X','7h30-9h,17h-22h','X','X','X'],
    Djamel: ['11h-19h','11h-19h','7h30-22h','9h-19h','7h30-22h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-06-15', employes: {
    Rudy:   ['ECOLE','ECOLE','ECOLE','ECOLE','ECOLE','X','X'],
    Selim:  ['ECOLE','18h30-20h30','ECOLE','ECOLE','ECOLE','X','9h30-11h30'],
    Myriam: ['7h30-11h,18h30-22h','7h30-11h,18h30-22h','X','7h30-11h,18h30-22h','X','X','X'],
    Djamel: ['11h-19h','11h-19h','7h30-22h','9h-19h','7h30-22h','9h-18h','9h-18h'],
  }},
  { lundi: '2026-06-22', employes: {
    Rudy:   ['CP','CP','CP','CP','CP','X','X'],
    Selim:  ['CP','CP','CP','CP','CP','X','9h30-11h30'],
    Myriam: ['7h30-11h,17h-22h','7h30-9h,17h-22h','X','7h30-9h,18h30-22h','X','X','X'],
    Djamel: ['11h-19h','11h-19h','7h30-22h','9h-19h','7h30-22h','9h-18h','9h-18h'],
  }},

  // ── Juillet 2026 ───────────────────────────────────────────────────────────
  { lundi: '2026-06-29', employes: {
    Rudy:   ['CP','CP','CP','CP','CP','X','X'],
    Selim:  ['9h30-13h30','7h30-13h30,18h30-20h30','7h30-12h30','17h-22h','18h30-20h30','9h-18h','9h30-11h30'],
    Myriam: ['7h30-11h,18h30-22h','18h-22h','17h30-22h','7h30-9h','X','X','X'],
    Djamel: ['10h30-18h30','10h-15h','10h-17h30','9h-17h','7h30-22h','X','9h-18h'],
  }},
  { lundi: '2026-07-06', employes: {
    Rudy:   ['CP','CP','CP','CP','X','X','X'],
    Selim:  ['9h30-13h30','7h30-13h30,18h30-20h30','7h30-12h30,18h-22h','X','18h30-20h30','9h-18h','9h30-11h30'],
    Myriam: ['7h30-9h,17h-22h','17h-22h','X','7h30-9h,18h30-22h','X','X','X'],
    Djamel: ['10h30-18h30','10h-18h','10h-18h','9h-20h','7h30-22h','X','9h-18h'],
  }},
  { lundi: '2026-07-13', employes: {
    Rudy:   ['CP','FERIE','CP','X','15h-22h','9h-18h','9h-11h,15h-18h'],
    Selim:  ['9h30-13h30','FERIE','7h30-12h30,18h-22h','7h30-15h30','7h30-15h','9h30-12h30','9h30-11h30'],
    Myriam: ['7h30-11h,18h30-22h','FERIE','X','15h30-22h','X','X','11h-18h'],
    Djamel: ['10h30-18h30','FERIE','10h-18h','ABSENT','ABSENT','ABSENT','ABSENT'],
  }},
  { lundi: '2026-07-20', employes: {
    Rudy:   ['X','7h30-15h','7h30-15h','X','15h-22h','9h-18h','9h-16h'],
    Selim:  ['7h30-16h','18h30-20h30','15h-22h','7h30-15h','7h30-15h','9h30-12h30','9h30-11h30'],
    Myriam: ['16h-22h','15h-22h','X','15h-22h','X','X','15h-18h'],
    Djamel: ['ABSENT','ABSENT','ABSENT','ABSENT','ABSENT','ABSENT','ABSENT'],
  }},

  // ── Août 2026 ──────────────────────────────────────────────────────────────
  { lundi: '2026-08-03', employes: {
    Rudy:  ['7h30-16h','X','X','15h-22h','X','X','X'],
    Selim: ['16h-22h','18h30-20h30','7h30-12h30','X','X','X','X'],
    Myriam:['X','X','X','X','X','X','X'],
    Djamel:['X','X','X','X','X','X','X'],
  }},
  { lundi: '2026-08-10', employes: {
    Rudy:  ['X','X','X','15h-22h','X','X','X'],
    Selim: ['16h-22h','18h30-20h30','X','X','X','X','X'],
    Myriam:['X','X','X','X','X','X','X'],
    Djamel:['X','X','X','X','X','X','X'],
  }},
  { lundi: '2026-08-17', employes: {
    Rudy:  ['X','X','X','15h-22h','X','X','X'],
    Selim: ['X','X','X','X','X','X','X'],
    Myriam:['X','X','X','X','X','X','X'],
    Djamel:['X','X','X','X','X','X','X'],
  }},
  { lundi: '2026-08-24', employes: {
    Rudy:  ['X','X','X','15h-22h','X','X','X'],
    Selim: ['X','X','X','X','X','X','X'],
    Myriam:['X','X','X','X','X','X','X'],
    Djamel:['X','X','X','X','X','X','X'],
  }},
];
