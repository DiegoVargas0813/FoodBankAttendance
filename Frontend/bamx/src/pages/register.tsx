import { useState } from 'react';
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

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const MIN_PW = 8;
  const MAX_PW = 64;

  const validatePassword = (pw: string): string | null => {
    if (!pw) return 'La contraseña es obligatoria.';
    if (pw.length < MIN_PW) return `La contraseña debe tener al menos ${MIN_PW} caracteres.`;
    if (pw.length > MAX_PW) return `La contraseña debe tener como máximo ${MAX_PW} caracteres.`;
    if (!/[A-Za-z]/.test(pw)) return 'La contraseña debe incluir al menos una letra.';
    if (!/[0-9]/.test(pw)) return 'La contraseña debe incluir al menos un número.';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'La contraseña debe incluir al menos un símbolo (ej. !@#$%).';
    return null;
  };

  const checkConfirmPassword = () => {
    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!checkConfirmPassword()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/signup/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'FAMILY' }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      setSuccessMsg('Registro exitoso. Revisa tu correo o inicia sesión.');
      // small delay then go to login
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error en la solicitud');
      console.error('Register error', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
    <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="px-6 py-5 bg-primary text-center rounded-t">
        <CardTitle className="text-2xl">Regístrate</CardTitle>
        <CardDescription>Crea una cuenta para tramitar tu solicitud</CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
        <CardContent className="px-6 space-y-4">
            {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
            {successMsg && <div className="text-sm text-green-700 bg-green-50 p-2 rounded">{successMsg}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                <label className="block text-sm mb-1 py-2">Nombre completo</label>
                <Input
                id="name"
                type="text"
                placeholder="Nombre completo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
            </div>
            <div>
                <label className="block text-sm mb-1 py-2">Correo electrónico</label>
                <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
                <label className="block text-sm mb-1 ">Contraseña</label>
                <Input
                id="password"
                type="password"
                placeholder="●●●●●●●●"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                <div className="text-xs text-gray-600 mt-2">
                  Requisitos: {MIN_PW}+ caracteres, incluir letra, número y símbolo.
                </div>
            </div>
            <div>
                <label className="block text-sm mb-1">Confirmar contraseña</label>
                <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirma contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                />
            </div>
            </div>
        </CardContent>

        <CardFooter className="px-6 py-5 flex flex-col gap-3">
            <Button className="w-full hover:bg-blue-700" type="submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>

            <div className="text-sm text-center">
            ¿Ya tienes cuenta?{' '}
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate('/')}>
                Iniciar sesión
            </button>
            </div>
        </CardFooter>
        </form>
    </Card>
    </div>
  );
};

export default Register;