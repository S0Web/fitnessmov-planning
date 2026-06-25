import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const links = [
  { to: '/',        label: 'Planning' },
  { to: '/coaches', label: 'Coaches' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="text-white shadow-md sticky top-0 z-30" style={{ backgroundColor: '#1a7a9b' }}>
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="logo" className="h-10 w-10 object-contain rounded" />
            <span className="font-bold text-base tracking-tight leading-none hidden sm:block">
              Fitnessmov&apos; <span style={{ color: '#5bcae8' }}>Planning</span>
            </span>
          </div>

          {/* Nav desktop */}
          <nav className="hidden sm:flex gap-1 flex-1">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
                }>{label}</NavLink>
            ))}
          </nav>

          {/* Spacer mobile */}
          <div className="flex-1 sm:hidden" />

          {/* Droite desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-white/70">{user?.prenom}</span>
            <NavLink to="/parametres" title="Paramètres"
              className={({ isActive }) => `p-1.5 rounded transition-colors ${isActive ? 'bg-white/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </NavLink>
            <button onClick={handleLogout} title="Déconnexion"
              className="p-1.5 rounded text-white/70 hover:bg-white/10 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Burger mobile */}
          <button onClick={() => setMenuOpen(o => !o)}
            className="sm:hidden p-1.5 rounded text-white/80 hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/20 px-4 py-3 space-y-1" style={{ backgroundColor: '#1a7a9b' }}>
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
                }>{label}</NavLink>
            ))}
            <NavLink to="/parametres" onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }>⚙ Paramètres</NavLink>
            <button onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded text-sm text-white/70 hover:bg-white/10 hover:text-white">
              ↪ Déconnexion ({user?.prenom})
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
