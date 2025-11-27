import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    if (!email) return setError('Correo requerido.');
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // always show generic success to avoid account enumeration
      setInfo('Si existe una cuenta con ese correo, recibirás un email con instrucciones.');
    } catch (err) {
      setError('No se pudo procesar la solicitud. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
        </CardHeader>

        <form onSubmit={submit}>
          <CardContent className="px-6 space-y-4">
            {info && <div className="text-sm text-green-700 bg-green-50 p-2 rounded">{info}</div>}
            {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}

            <div>
              <label className="block text-sm mb-1">Correo electrónico</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
          </CardContent>

          <CardFooter className="px-6 py-5">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}