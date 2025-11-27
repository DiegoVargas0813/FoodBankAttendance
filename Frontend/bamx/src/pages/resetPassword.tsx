import { useState, useEffect } from 'react';
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromQuery = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setToken(tokenFromQuery), [tokenFromQuery]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFieldError(null);
    setMessage(null);
    if (!token) return setFieldError('Token requerido.');
    const pwErr = validatePassword(password);
    if (pwErr) return setFieldError(pwErr);
    if (password !== confirm) return setFieldError('Las contraseñas no coinciden.');
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldError(body?.error || 'Error al restablecer contraseña.');
        return;
      }
      setMessage('Contraseña actualizada. Redirigiendo…');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setFieldError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        </CardHeader>

        <form onSubmit={submit}>
          <CardContent className="px-6 space-y-4">
            {message && <div className="text-sm text-green-700 bg-green-50 p-2 rounded">{message}</div>}
            {fieldError && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{fieldError}</div>}

            <div>
              <label className="block text-sm mb-1">Token</label>
              <Input value={token} onChange={(e) => setToken(e.target.value)} />
              <div className="text-xs text-gray-500 mt-1">El token viene en el enlace del correo.</div>
            </div>

            <div>
              <label className="block text-sm mb-1">Contraseña</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra, un número y un símbolo</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm mb-1">Confirmar contraseña</label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
          </CardContent>

          <CardFooter className="px-6 py-5">
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Aplicando...' : 'Actualizar contraseña'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}