import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/layout';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type Invite = {
  id: number;
  email: string;
  role: string;
  token: string;
  expires_at?: string;
  used?: number;
  invited_by_username?: string;
  created_at?: string;
};

const apiUrl = import.meta.env.VITE_API_URL || '';

export default function InvitesAdmin() {
  const { fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth?.(`${apiUrl}/invites`, { method: 'GET' });
      if (!res || !res.ok) throw new Error(await (res ? res.text() : Promise.resolve('no fetchWithAuth')));
      const json = await res.json();
      setList(json.invites || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createInvite = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!email) return setError('Email required');
    setLoading(true);
    try {
      const res = await fetchWithAuth?.(`${apiUrl}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      if (!res || !res.ok) throw new Error(await (res ? res.text() : Promise.resolve('no fetchWithAuth')));
      setEmail('');
      setRole('ADMIN');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const resend = async (token: string) => {
    if (!confirm('Reenviar invitación?')) return;
    try {
      const res = await fetchWithAuth?.(`${apiUrl}/invites/${token}/resend`, { method: 'POST' });
      if (!res || !res.ok) throw new Error(await (res ? res.text() : Promise.resolve('no fetchWithAuth')));
      alert('Invitación reenviada');
      await load();
    } catch (err: any) {
      alert(err?.message || 'Error');
    }
  };

  const cancel = async (token: string) => {
    if (!confirm('Cancelar invitación?')) return;
    try {
      const res = await fetchWithAuth?.(`${apiUrl}/invites/${token}/cancel`, { method: 'POST' });
      if (!res || !res.ok) throw new Error(await (res ? res.text() : Promise.resolve('no fetchWithAuth')));
      await load();
    } catch (err: any) {
      alert(err?.message || 'Error');
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-2xl">Invitar administrador / cuenta privilegiada</CardTitle>
          </CardHeader>

          <form onSubmit={createInvite}>
            <CardContent className="px-6 space-y-4">
              {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Correo</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
                </div>

                <div>
                  <label className="block text-sm mb-1">Rol</label>
                  <select className="w-full px-3 py-2 border rounded" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="ADMIN">Administrador</option>
                    {/* <option value="VOLUNTEER">Voluntario</option> */}
                    {/*<option value="DRIVER">Conductor</option>*/}
                    {/*<option value="FAMILY">Familia</option>*/}
                  </select>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 py-5 flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Crear invitación'}</Button>
              <Button variant="ghost" onClick={() => navigate('/pending-approvals')}>Volver</Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Invitaciones recientes</h2>
          {loading && <div>Cargando...</div>}
          {!loading && list.length === 0 && <div>No hay invitaciones.</div>}
          <div className="space-y-3">
            {list.map(inv => (
              <div key={inv.token} className="border rounded p-3 bg-white flex items-center justify-between">
                <div>
                  <div className="font-medium">{inv.email} <span className="text-xs text-gray-500">({inv.role})</span></div>
                  <div className="text-xs text-gray-600">Invitado por: {inv.invited_by_username || '—'} · {inv.created_at || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!inv.used && <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => resend(inv.token)}>Reenviar</button>}
                  {!inv.used && <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => cancel(inv.token)}>Cancelar</button>}
                  <button className="px-3 py-1 border rounded" onClick={() => navigator.clipboard?.writeText(`${location.origin}/accept-invite?token=${inv.token}`)}>Copiar enlace</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}