// ...existing code...
import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/layout/layout';
import { useAuth } from '../context/AuthContext';

type FamilyRow = {
  idfamilies: number;
  idusers: number;
  status: string;
  username?: string;
  email?: string;
  form_data?: any;
};

const apiUrl = import.meta.env.VITE_API_URL || '';

export default function ApprovedList() {
  const { fetchWithAuth } = useAuth();
  const [list, setList] = useState<FamilyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  // pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number | null>(null);

  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : null;

  const fetchList = useCallback(
    async (q = '', p = 1, ps = 10) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(p));
        params.set('pageSize', String(ps));
        if (q) params.set('q', q);
        const url = `${apiUrl}/family/approved?${params.toString()}`;

        let res;
        if (fetchWithAuth) {
          res = await fetchWithAuth(url, { method: 'GET' });
        } else {
          const token = localStorage.getItem('token');
          res = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
        }

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Failed to load');
        }
        const json = await res.json();
        const rows: FamilyRow[] = json.families || [];
        setList(rows);

        if (typeof json.total === 'number') {
          setTotal(json.total);
        } else {
          // fallback: if backend doesn't return total, infer it
          if (rows.length < ps) {
            setTotal((p - 1) * ps + rows.length);
          } else {
            // unknown total, guess at least one more page
            setTotal((p + 1) * ps);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth]
  );

  useEffect(() => {
    fetchList(query.trim(), page, pageSize);
  }, [fetchList, page, pageSize]);

  // debounce search: reset to page 1 when query changes
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchList(query.trim(), 1, pageSize);
    }, 300);
    return () => clearTimeout(t);
  }, [query, pageSize, fetchList]);

  const downloadExcel = async (id: number) => {
    setProcessingId(id);
    try {
      const url = `${apiUrl}/family/${id}/export`;
      let res;
      if (fetchWithAuth) {
        res = await fetchWithAuth(url, { method: 'GET' });
      } else {
        const token = localStorage.getItem('token');
        res = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
      }
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') || '';
      let filename = `family_${id}.zip`;
      const match = cd.match(/filename="?(.+?)"?($|;)/);
      if (match && match[1]) filename = match[1];
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);
    } catch (err: any) {
      alert(`Error descargando archivo: ${err?.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  const gotoPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalPages && p > totalPages) p = totalPages;
    setPage(p);
  };

  const renderPager = () => {
    if (totalPages === null) return null;
    const pages: number[] = [];
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          {total !== null && `Mostrando ${Math.min((page - 1) * pageSize + 1, total)} - ${Math.min(page * pageSize, total)} de ${total}`}
        </div>

        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded" onClick={() => gotoPage(page - 1)} disabled={page <= 1}>
            Prev
          </button>

          {pages.map((p) => (
            <button
              key={p}
              className={`px-3 py-1 rounded ${p === page ? 'bg-primary text-primary-foreground' : 'border'}`}
              onClick={() => gotoPage(p)}
            >
              {p}
            </button>
          ))}

          <button className="px-2 py-1 border rounded" onClick={() => gotoPage(page + 1)} disabled={totalPages !== null && page >= totalPages}>
            Next
          </button>

          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-3 border rounded px-2 py-1">
            <option value={10}>10 / página</option>
            <option value={25}>25 / página</option>
            <option value={50}>50 / página</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Familias/Usuarios aprobados</h1>
          <div className="w-full max-w-sm">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {loading && <div>Cargando...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !list.length && <div>No se encontraron registros.</div>}

        <div className="space-y-4 mt-4">
          {list.map((row) => (
            <div key={row.idfamilies} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">
                    #{row.idfamilies} — {row.username || row.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    Usuario ID: {row.idusers} — Estado: {row.status}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => downloadExcel(row.idfamilies)}
                    disabled={processingId === row.idfamilies}
                  >
                    {processingId === row.idfamilies ? 'Descargando...' : 'Descargar Excel'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {renderPager()}
      </div>
    </Layout>
  );
}