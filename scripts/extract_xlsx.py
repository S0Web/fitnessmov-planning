import pandas as pd
import json

path = r"C:\Users\selim\Downloads\Coachs cours co.xlsx"
xl = pd.ExcelFile(path)

coaches_set = set()
pointeurs_set = set()
cours_set = set()
seances = []

statut_map = {
    'Effectué': 'effectue', 'effectué': 'effectue',
    'Annulé': 'annule', 'annulé': 'annule',
    'Payé': 'paye', 'payé': 'paye',
    'Programmé': 'programme',
}

def safe_int(v, default=None):
    try:
        return int(float(str(v)))
    except:
        return default

for sheet in xl.sheet_names:
    # Ignore les onglets non-planning
    if any(k in sheet for k in ['cap', 'Analyse', 'board', 'Dash']):
        continue

    df = pd.read_excel(path, sheet_name=sheet, header=None)
    # Assure 8 colonnes min
    while df.shape[1] < 8:
        df[df.shape[1]] = None

    current_date = None

    for _, row in df.iterrows():
        cell0 = row.iloc[0] if len(row) > 0 else None
        cell1 = row.iloc[1] if len(row) > 1 else None

        # Ligne titre semaine
        if isinstance(cell0, str) and 'SEMAINE' in cell0:
            continue

        # Nouvelle date
        if pd.notna(cell0) and hasattr(cell0, 'date'):
            current_date = cell0.date().isoformat()
            continue
        # Date en string ISO
        if pd.notna(cell0) and isinstance(cell0, str) and len(cell0) >= 8 and '-' in str(cell0):
            try:
                from datetime import date
                current_date = str(cell0).strip()[:10]
            except:
                pass
            continue

        # Ligne de séance
        if pd.notna(cell1) and isinstance(cell1, str) and cell1.strip() and current_date:
            cours    = str(cell1).strip()
            coach    = str(row.iloc[2]).strip() if pd.notna(row.iloc[2]) else ''
            horaire  = str(row.iloc[3]).strip() if pd.notna(row.iloc[3]) else ''
            duree    = safe_int(row.iloc[4], 60)
            statut_r = str(row.iloc[5]).strip() if pd.notna(row.iloc[5]) else ''
            nb       = safe_int(row.iloc[6])
            pointeur = str(row.iloc[7]).strip() if pd.notna(row.iloc[7]) else ''

            statut = statut_map.get(statut_r, 'programme')

            cours_set.add(cours)
            if coach: coaches_set.add(coach)
            if pointeur and pointeur.lower() != 'nan': pointeurs_set.add(pointeur)

            seances.append({
                'date': current_date,
                'cours': cours,
                'coach': coach,
                'horaire': horaire,
                'duree': duree,
                'statut': statut,
                'nb_presents': nb,
                'pointeur': pointeur if pointeur and pointeur.lower() != 'nan' else '',
                'sheet': sheet,
            })

result = {
    'coaches': sorted(coaches_set),
    'pointeurs': sorted(pointeurs_set),
    'cours': sorted(cours_set),
    'seances_count': len(seances),
    'seances': seances,
}

with open(r"C:\Users\selim\Documents\fitnessmov-planning\scripts\extracted.json", 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("COACHES:", sorted(coaches_set))
print("POINTEURS:", sorted(pointeurs_set))
print("COURS:", sorted(cours_set))
print("SEANCES TOTAL:", len(seances))
print("Sauvegardé dans extracted.json")
