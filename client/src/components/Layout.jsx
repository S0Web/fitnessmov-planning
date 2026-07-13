import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings as GearIcon, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { colorForUser } from '../lib/utils';
import SalleSwitcher from './SalleSwitcher';

const links = [
  { to: '/',                   label: 'Planning des cours' },
  { to: '/planning-personnel', label: 'Planning personnel' },
  { to: '/coaches',             label: 'Coaches' },
  { to: '/annuaire',           label: 'Annuaire' },
];

function Bubble({ user, size = 'h-7 w-7' }) {
  return (
    <span
      className={`${size} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
      style={{ backgroundColor: colorForUser(user.id) }}
    >
      {user.prenom?.[0]}{user.nom?.[0]}
    </span>
  );
}

export default function Layout({ children }) {
  const { user, switchProfile } = useAuth();
  const { salleNom } = useConfig();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-sky-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4 md:gap-8">
          <span className="font-bold text-base md:text-lg tracking-tight whitespace-nowrap flex items-baseline gap-2">
            Fitnessmov&apos; Planning
            {salleNom && (
              <span className="text-[11px] font-semibold bg-white/20 text-white rounded-full px-2 py-0.5 whitespace-nowrap">
                {salleNom}
              </span>
            )}
          </span>

          {/* Nav desktop */}
          <nav className="hidden md:flex gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-sky-100 hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Profil + réglages desktop */}
          {user && (
            <div className="hidden md:flex ml-auto items-center gap-3">
              {user.role === 'manager' && <SalleSwitcher currentSalle={salleNom} dark />}
              <button
                onClick={switchProfile}
                title="Changer de profil"
                aria-label="Changer de profil"
                className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-white/10 transition-colors"
              >
                <Bubble user={user} />
                <span className="text-sm text-sky-100">{user.prenom}</span>
              </button>
              <NavLink
                to="/parametres"
                title="Paramètres"
                aria-label="Paramètres"
                className={({ isActive }) => `p-1.5 rounded-full transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-sky-100 hover:bg-white/10'}`}
              >
                <GearIcon className="h-5 w-5" strokeWidth={1.8} />
              </NavLink>
            </div>
          )}

          {/* Burger mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="md:hidden ml-auto p-1.5 rounded hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-sky-700 px-3 py-2 space-y-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-sky-100 hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/parametres"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-sky-100 hover:bg-white/10'
                }`
              }
            >
              <GearIcon className="h-5 w-5" /> Paramètres
            </NavLink>
            {user && (
              <button
                onClick={() => { setMenuOpen(false); switchProfile(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 mt-1 border-t border-white/10 rounded text-sm text-sky-100 hover:bg-white/10 transition-colors"
              >
                <Bubble user={user} size="h-6 w-6" />
                Changer de profil ({user.prenom})
              </button>
            )}
            {user?.role === 'manager' && (
              <div className="px-3 py-2">
                <SalleSwitcher currentSalle={salleNom} dark />
              </div>
            )}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
