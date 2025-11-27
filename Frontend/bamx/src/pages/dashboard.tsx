import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import components
import Layout from "../components/layout/layout";

const DashboardItemsByRole: Record<string, { name: string; link: string }[]> = {
  ADMIN: [
    { name: 'Aprovaciones Pendientes', link: '/pending-approvals' },
    { name: 'Usuarios Aprobados', link: '/approved-list' },
    { name: 'Invitar Administrador', link: '/invites-admin' },
    { name: 'Mi Perfil', link: '/profile' },
  ],
  FAMILY: [
    { name: 'Mi Perfil', link: '/profile' },
    { name: 'Formulario de Beneficiarios', link: '/form' }, // family users fill form
  ],
  USER: [
    { name: 'Mi Perfil', link: '/profile' },
    // omit /form for plain USER if desired
  ],
};

function decodeJwtRole(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // fix base64 url -> base64 and pad
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const json = JSON.parse(window.atob(b64 + pad));
    return json?.role || json?.roles || json?.roleName || null;
  } catch {
    return null;
  }
}

const Dashboard = () => {
  // @ts-ignore
  const navigate = useNavigate();
  // role can be 'ADMIN'|'FAMILY'|'USER' or null
  const [role, setRole] = useState<string | null>(null);
  // @ts-ignore
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // priority: explicit stored role, then decode token
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
      return;
    }
    const token = localStorage.getItem('token');
    const decodedRole = decodeJwtRole(token);
    if (typeof decodedRole === 'string') {
      // normalize role string to uppercase short key if your token uses different values
      setRole(decodedRole.toUpperCase());
    } else {
      setRole('USER'); // fallback
    }
  }, []);

  const items = role ? (DashboardItemsByRole[role] || DashboardItemsByRole.USER) : DashboardItemsByRole.USER;

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.link}
              className="bg-white shadow rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition"
              onClick={() => navigate(item.link)}
            >
              <span className="text-lg font-semibold">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;