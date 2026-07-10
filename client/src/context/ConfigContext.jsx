import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const ConfigContext = createContext({ salleNom: '' });

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({ salleNom: '' });

  useEffect(() => {
    api.getConfig()
      .then(c => {
        setConfig(c);
        // Titre d'onglet distinct par salle (pratique quand on gère plusieurs
        // instances ouvertes en même temps).
        document.title = c.salleNom ? `Planning Fitnessmov — ${c.salleNom}` : 'Planning Fitnessmov';
      })
      .catch(() => {});
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  return useContext(ConfigContext);
}
