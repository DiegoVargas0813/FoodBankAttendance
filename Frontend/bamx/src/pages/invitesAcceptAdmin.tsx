// ...existing code...
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const apiUrl = import.meta.env.VITE_API_URL || '';

const validatePassword = (pw: string): string | null => {
  if (!pw) return 'La contraseña es obligatoria.';
  if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (pw.length > 64) return 'La contraseña debe tener como máximo 64 caracteres.';
  if (!/[A-Za-z]/.test(pw)) return 'La contraseña debe incluir al menos una letra.';
  if (!/[0-9]/.test(pw)) return 'La contraseña debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'La contraseña debe incluir al menos un símbolo (ej. !@#$%).';
  return null;
};

export default function InvitesAcceptAdmin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromQuery = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromQuery);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => { setToken(tokenFromQuery); }, [tokenFromQuery]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessage(null);
    setFieldError(null);

    if (!token) { setFieldError('Token requerido.'); return; }
    if (!username || username.trim().length < 3) { setFieldError('Nombre requerido (mínimo 3 caracteres).'); return; }

    const pwErr = validatePassword(password);
    if (pwErr) { setFieldError(pwErr); return; }
    if (password !== confirmPassword) { setFieldError('Las contraseñas no coinciden.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/invites/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username: username.trim(), password })
      });

      let bodyText = '';
      try {
        const json = await res.json();
        bodyText = json?.error || json?.message || JSON.stringify(json);
      } catch {
        bodyText = await res.text();
      }

      if (!res.ok) {
        setMessage(bodyText || `Error HTTP ${res.status}`);
        return;
      }

      setMessage('Cuenta creada. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      setMessage('No se pudo conectar con el servidor. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-2xl">Aceptar invitación</CardTitle>
        </CardHeader>

        <form onSubmit={submit}>
          <CardContent className="px-6 space-y-4">
            {message && <div className="text-sm text-gray-700">{message}</div>}
            {fieldError && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{fieldError}</div>}

            <div>
              <label className="block text-sm mb-1">Token</label>
              <Input value={token} onChange={(e) => setToken(e.target.value)} />
              <div className="text-xs text-gray-500 mt-1">El token fue incluido en el enlace de invitación.</div>
            </div>

            <div>
              <label className="block text-sm mb-1">Nombre de usuario</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                <li>Mínimo 8 caracteres</li>
                <li>Máximo 64 caracteres</li>
                <li>Al menos una letra y un número</li>
                <li>Al menos un símbolo (ej. !@#$%)</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm mb-1">Confirmar contraseña</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </CardContent>

          <CardFooter className="px-6 py-5 flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>Volver</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}