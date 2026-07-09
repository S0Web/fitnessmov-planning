import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colorForUser } from '../lib/utils';

const links = [
  { to: '/',                   label: 'Planning des cours' },
  { to: '/planning-personnel', label: 'Planning personnel' },
  { to: '/coaches',             label: 'Coaches' },
  { to: '/parametres',         label: 'Paramètres' },
];

export default function Layout({ children }) {
  const { user, switchProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-sky-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-8">
          <span className="font-bold text-lg tracking-tight">Fitnessmov&apos; Planning</span>
          <nav className="flex gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-sky-100 hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <button
              onClick={switchProfile}
              title="Changer de profil"
              className="ml-auto flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-white/10 transition-colors"
            >
              <span
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: colorForUser(user.id) }}
              >
                {user.prenom?.[0]}{user.nom?.[0]}
              </span>
              <span className="text-sm text-sky-100">{user.prenom}</span>
            </button>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
