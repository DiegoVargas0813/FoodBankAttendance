import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {setUser, isAuthenticated, loading} = useAuth();

    useEffect(() => {
    // If already logged in, redirect to dashboard
        if(!loading && isAuthenticated) {
        navigate('/dashboard');
        }
    }, [loading, isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/signup/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        });

        if (res.status === 403) {
            const json = await res.json();
            // redirect to confirm notice page with email in state
            navigate('/confirm-notice', { state: { email: json?.email || email } });
            setIsLoading(false);
            return;
        }

        // For any other non-ok response, show only a generic "invalid credentials" message
        if (!res.ok) {
        setError('Credenciales inválidas');
        setIsLoading(false);
        return;
        }

        const data = await res.json();
        if (!data || !data.accessToken || !data.user) {
          setError('Credenciales inválidas');
          return;
        }

        localStorage.setItem('token', data.accessToken);
        const userObj = {
        email: data.user.email,
        name: data.user.username || data.user.name || '',
        role: (data.user.role || '').toUpperCase(),
        id: data.user.id || data.user.idusers || null,
        };
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj, data.accessToken);

        // Navigate to dashboard after login
        navigate('/dashboard');
    } catch (err) {
        // Keep UI error generic to avoid leaking server/internal details
        setError('Credenciales inválidas');
    } finally {
        setIsLoading(false);
    }
    };

    return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      {/* center wrapper: logo above the card, responsive sizing */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <img
          src="/Logo.svg"
          alt="Red BAMX"
          className="mb-6 w-auto h-12 sm:h-14 md:h-16 lg:h-20 object-contain"
        />

        <Card className="w-full rounded">
            <CardHeader className="px-6 py-5 text-center bg-primary rounded-t">
                <CardTitle className="text-2xl text-primary-foreground">Iniciar sesión</CardTitle>
                <CardDescription className="text-primary-foreground/90">Accede a tu cuenta de Red BAMX</CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
            <CardContent className="px-6 space-y-4 py-4">
                {error && (
                <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                    {error}
                </div>
                )}

                <div>
                <label className="block text-sm mb-1">Correo electrónico</label>
                <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </div>

                <div>
                <label className="block text-sm mb-1">Contraseña</label>
                <Input
                    id="password"
                    type="password"
                    placeholder="●●●●●●●●"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>

                <div className="flex items-center justify-between text-sm">
                <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate('/forgot-password')}
                >
                    ¿Olvidaste tu contraseña?
                </button>
                <button
                    type="button"
                    className="text-gray-600 hover:underline"
                    onClick={() => navigate('/register')}
                >
                    Crear cuenta
                </button>
                </div>
            </CardContent>

            <CardFooter className="px-6 py-5">
                <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                >
                {isLoading ? 'Cargando...' : 'Iniciar sesión'}
                </Button>
            </CardFooter>
            </form>
        </Card>
      </div>
    </div>
    );
};

export default Login;