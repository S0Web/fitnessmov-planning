import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',        label: 'Planning cours collectifs' },
  { to: '/coaches', label: 'Coaches' },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-sky-700 text-white shadow-md">
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
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
