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

  function handleLogout() {
    logout();
    navigate('/login');
  }

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
          <nav className="flex gap-1 flex-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Droite : user + settings + logout */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">{user?.prenom}</span>
            <NavLink to="/parametres" title="Paramètres"
              className={({ isActive }) =>
                `p-1.5 rounded transition-colors ${isActive ? 'bg-white/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </NavLink>
            <button onClick={handleLogout} title="Se déconnecter"
              className="p-1.5 rounded text-white/70 hover:bg-white/10 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
