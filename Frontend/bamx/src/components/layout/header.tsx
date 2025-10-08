import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <header className="w-full flex items-center justify-between px-6 py-3 bg-white border-b border-border shadow-sm">
            <div className="flex items-center gap-2">
                <img src="/vite.svg" alt="Logo" className="h-8 w-8" />
                <span className="font-bold text-lg">Banco de Alimentos</span>
            </div>
            <div className="flex items-center gap-4">
                {user && (
                <>
                    <span className="text-sm text-gray-700">
                    {user.name} ({user.role})
                    </span>
                    <button
                    onClick={handleLogout}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                    >
                    Logout
                    </button>
                </>
                )}
            </div>
        </header>
    );
};

export default Header;