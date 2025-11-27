import { useEffect, useState, useCallback } from 'react';
//import { useNavigate } from 'react-router-dom';

//Components
import Layout from "../components/layout/layout";

type FamilyRow = {
  idfamilies: number;
  idusers: number;
  status: string;
  username?: string;
  email?: string;
  form_data?: any;
};

const apiUrl = import.meta.env.VITE_API_URL || '';

export default function PendingApprovalsPage() {
  //const navigate = useNavigate();
  const [list, setList] = useState<FamilyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // @ts-ignore
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  const token = localStorage.getItem('token');

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/family/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setList(json.families || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    if (!confirm(`Confirmar ${status} para la familia ${id}?`)) return;
    setProcessingId(id);
    try {
      const res = await fetch(`${apiUrl}/family/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchList();
    } catch (err: any) {
      alert(`Error: ${err?.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  const downloadExcel = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${apiUrl}/family/${id}/export`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const blob = await res.blob();

      // Try to extract filename from Content-Disposition header, fallback to zip name
      const cd = res.headers.get('content-disposition') || '';
      let filename = `family_${id}.zip`;
      const match = cd.match(/filename="?(.+?)"?($|;)/);
      if (match && match[1]) filename = match[1];

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error descargando archivo: ${err?.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout>
      <div className="p-6">

        <h1 className="text-2xl font-bold mb-4">Aprobaciones pendientes</h1>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !list.length && <div>No hay solicitudes pendientes.</div>}

        <div className="space-y-4 mt-4">
          {list.map(row => (
            <div key={row.idfamilies} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">#{row.idfamilies} — {row.username || row.email}</div>
                  <div className="text-sm text-gray-600">Usuario ID: {row.idusers} — Estado: {row.status}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded"
                    onClick={() => updateStatus(row.idfamilies, 'approved')}
                    disabled={processingId === row.idfamilies}
                  >
                    {processingId === row.idfamilies ? 'Procesando...' : 'Aprobar'}
                  </button>

                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => updateStatus(row.idfamilies, 'rejected')}
                    disabled={processingId === row.idfamilies}
                  >
                    {processingId === row.idfamilies ? 'Procesando...' : 'Rechazar'}
                  </button>

                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => downloadExcel(row.idfamilies)}
                    disabled={processingId === row.idfamilies}
                  >
                    {processingId === row.idfamilies ? 'Descargando...' : 'Descargar Excel'}
                  </button>
                </div>
              </div>

              {expanded[row.idfamilies] && (
                <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(row.form_data, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}