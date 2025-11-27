// ...existing code...
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-primary border-b border-border shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile toggle on the left */}
        <button
          className="md:hidden p-2 rounded bg-transparent"
          aria-label="Abrir menú"
          onClick={() => window.dispatchEvent(new Event('toggleSidebar'))}
        >
          ☰
        </button>

        <img src="/Logo.svg" alt="Logo" className="h-8 w-8" />
        <span className="font-bold text-lg">Red BAMX</span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-primary-foreground">{user.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
// ...existing code...