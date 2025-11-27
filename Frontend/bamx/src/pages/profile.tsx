import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

type Profile = {
  idusers?: number;
  email?: string;
  username?: string;
  role?: string;
  created_at?: string;
  is_confirmed?: boolean;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, fetchWithAuth, logout } = useAuth();
  const apiUrl = (import.meta.env as any).VITE_API_URL || '';

  const [profile, setProfile] = useState<Profile | null>(user ?? null);
  const [loading, setLoading] = useState(false);
  const [familyStatus, setFamilyStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // translation maps
  const roleLabels: Record<string, string> = {
    FAMILY: 'Familia',
    ADMIN: 'Administrador',
    VOLUNTEER: 'Voluntario',
    DRIVER: 'Conductor',
  };
  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };

  const role = (profile?.role || user?.role || '').toUpperCase();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Try to fetch canonical full profile from API if available
        if (fetchWithAuth) {
          const res = await fetchWithAuth(`${apiUrl}/users/me`, { method: 'GET' });
          if (res.ok) {
            const json = await res.json();
            if (!cancelled) setProfile(json.user || json || profile);
          }
        }
      } catch (e) {
        // ignore, fallback to local context user
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (role === 'FAMILY' && fetchWithAuth) {
      (async () => {
        try {
          const res = await fetchWithAuth(`${apiUrl}/family/status`, { method: 'GET' });
          if (res.ok) {
            const j = await res.json();
            if (mounted) setFamilyStatus((j && j.status) ? String(j.status) : null);
          }
        } catch (e) { /* ignore */ }
      })();
    }
    return () => { mounted = false; };
  }, [role, fetchWithAuth]);

  const handleResend = async () => {
    if (!profile?.email) { setMessage('Correo no disponible'); return; }
    setMessage('Enviando correo...');
    try {
      const res = await fetch(`${apiUrl}/confirm/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Error');
      setMessage('Correo de confirmación reenviado. Revisa tu bandeja.');
    } catch (err: any) {
      setMessage(err?.message || 'No se pudo reenviar el correo.');
    }
  };

  const displayedRole = roleLabels[role] || (role || 'Usuario');
  const displayedFamilyStatus = familyStatus ? (statusLabels[familyStatus.toLowerCase()] || familyStatus) : '—';

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-2xl">Mi perfil</CardTitle>
          </CardHeader>

          <CardContent className="px-6">
            {loading ? (
              <div className="text-sm text-gray-600">Cargando perfil...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Nombre</div>
                    <div className="font-medium">{profile?.username || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Correo</div>
                    <div className="font-medium">{profile?.email || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Rol</div>
                    <div className="font-medium">{displayedRole}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Confirmado</div>
                    <div className="font-medium">{profile?.is_confirmed ? 'Sí' : 'No'}</div>
                  </div>
                </div>

                {role === 'FAMILY' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Estado de la familia</div>
                    <div className="font-medium">{displayedFamilyStatus}</div>
                    <div className="text-xs text-gray-500 mt-1">Solo lectura. Para cambios contacte al equipo administrativo.</div>
                  </div>
                )}

                {role === 'ADMIN' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Herramientas de administrador</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <Button onClick={() => navigate('/pending-approvals')}>Aprobaciones pendientes</Button>
                      <Button onClick={() => navigate('/approved-list')} variant="ghost">Gestión de usuarios</Button>
                    </div>
                  </div>
                )}

                {!profile?.is_confirmed && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-yellow-800">Tu correo no está confirmado.</div>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={handleResend}>Reenviar correo de confirmación</Button>
                      <Button onClick={() => navigate('/confirm-notice', { state: { email: profile?.email } })} variant="ghost">Más opciones</Button>
                    </div>
                  </div>
                )}

                {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
              </>
            )}
          </CardContent>

          <CardFooter className="px-6 py-5 flex gap-2">
            {/* Edit profile removed per request; keep logout */}
            <Button variant="ghost" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}