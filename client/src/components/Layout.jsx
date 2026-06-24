import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

const links = [
  { to: '/',        label: 'Planning' },
  { to: '/coaches', label: 'Coaches' },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="text-white shadow-md sticky top-0 z-30" style={{ backgroundColor: '#1a7a9b' }}>
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Fitnessmov' logo" className="h-11 w-11 object-contain rounded" />
            <span className="font-bold text-lg tracking-tight leading-none">
              Fitnessmov&apos; <span style={{ color: '#5bcae8' }}>Planning</span>
            </span>
          </div>
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
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
