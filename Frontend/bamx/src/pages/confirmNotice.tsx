import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

const ConfirmNotice = () => {
  const nav = useNavigate();
  const { state } = useLocation() as any;
  const initialEmail = state?.email || '';
  const [email] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'deleted' | 'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const resend = async () => {
    if (!email) return setMsg('Email faltante.');
    setStatus('sending');
    try {
      const res = await fetch(`${apiUrl}/confirm/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Error');
      setStatus('sent');
      setMsg('Se envió el correo de confirmación. Revisa tu bandeja.');
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.message || 'No se pudo reenviar el correo.');
    }
  };

  const deleteAccount = async () => {
    if (!confirm('¿Eliminar tu cuenta no confirmada? Esto no se puede deshacer.')) return;
    setStatus('sending');
    try {
      const res = await fetch(`${apiUrl}/confirm/delete-unconfirmed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Error');
      setStatus('deleted');
      setMsg('Cuenta eliminada. Serás redirigido al registro.');
      setTimeout(() => nav('/register'), 1400);
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.message || 'No se pudo eliminar la cuenta.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-2xl">Confirma tu correo</CardTitle>
        </CardHeader>

        <CardContent className="px-6">
          <p className="text-sm text-gray-700">
            La cuenta asociada a <strong>{email || 'tu correo'}</strong> aún no ha sido confirmada.
          </p>

          <div className="mt-3 space-y-2">
            <div className="text-sm">Opciones:</div>
            <div className="flex gap-2">
              <Button className="hover:bg-gray-200" onClick={resend} disabled={status === 'sending'}>Reenviar correo de confirmación</Button>
              <Button className="hover:bg-gray-200" variant="destructive" onClick={deleteAccount} disabled={status === 'sending'}>Eliminar cuenta</Button>
            </div>
            {msg && <div className={`text-sm mt-2 ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{msg}</div>}
          </div>
        </CardContent>

        <CardFooter className="px-6 py-5">
          <div className="flex gap-2">
            <Button className="hover:bg-gray-200" onClick={() => nav('/')} variant="ghost">Ir a iniciar sesión</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmNotice;