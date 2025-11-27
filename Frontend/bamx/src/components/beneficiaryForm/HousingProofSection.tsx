// ...existing code...
import React, { useRef, useState } from 'react';

type FileRecord = { idfiles: number; file_path: string; file_type: string };
type UploadStatus = {
  tempId: string;
  fileType: 'ID_PHOTO' | 'ADDRESS_PHOTO';
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
};

type Props = {
  data?: any;
  onChange: (data: Partial<Record<string, any>>) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

export default function HousingProofSection({ data = {}, onChange, onNext, onPrev }: Props) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const existing: FileRecord[] = Array.isArray(data.media_files) ? data.media_files : [];
  const [files, setFiles] = useState<FileRecord[]>(existing);
  const [statuses, setStatuses] = useState<UploadStatus[]>([]);
  // Ensure apiUrl points to backend base WITHOUT trailing slash, e.g. http://localhost:3000
  const apiUrl = (import.meta.env as any).VITE_API_URL || '';

  const idInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  const updateStatus = (tempId: string, patch: Partial<UploadStatus>) => {
    setStatuses(prev => prev.map(s => (s.tempId === tempId ? { ...s, ...patch } : s)));
  };

  function uploadFileXhr(file: File, fileType: 'ID_PHOTO' | 'ADDRESS_PHOTO', tempId: string) {
    return new Promise<FileRecord>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // use /api/media/upload because backend mounts route at /api/media
      const url = `${apiUrl}/media/upload`;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('file_type', fileType);

      xhr.open('POST', url, true);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          updateStatus(tempId, { progress: pct });
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            if (!json?.file) {
              updateStatus(tempId, { status: 'error', error: 'Respuesta inválida del servidor' });
              return reject(new Error('Invalid server response'));
            }
            updateStatus(tempId, { progress: 100, status: 'done' });
            resolve(json.file as FileRecord);
          } catch (err: any) {
            updateStatus(tempId, { status: 'error', error: err?.message || 'Parse error' });
            reject(err);
          }
        } else {
          let errMsg = 'Upload failed';
          try {
            const json = JSON.parse(xhr.responseText || '{}');
            if (json?.error) errMsg = json.error;
          } catch {}
          updateStatus(tempId, { status: 'error', error: errMsg });
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        updateStatus(tempId, { status: 'error', error: 'Network error' });
        reject(new Error('Network error'));
      };

      xhr.send(fd);
    });
  }

  async function handleSelectedFile(file: File, fileType: 'ID_PHOTO' | 'ADDRESS_PHOTO') {
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setStatuses(prev => [
      ...prev,
      { tempId, fileType, name: file.name, progress: 0, status: 'uploading' },
    ]);

    try {
      const uploaded = await uploadFileXhr(file, fileType, tempId);

      // backend replaces previous record for same (user,file_type) so just update UI with returned record
      setFiles(prev => {
        const idx = prev.findIndex(p => p.file_type === uploaded.file_type);
        let next;
        if (idx >= 0) {
          next = prev.slice();
          next[idx] = uploaded;
        } else {
          next = [...prev, uploaded];
        }
        onChange({ media_files: next });
        return next;
      });
    } catch (err: any) {
      console.error('Upload error', err);
    }
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>, fileType: 'ID_PHOTO' | 'ADDRESS_PHOTO') {
    const f = e.target.files?.[0];
    if (!f) return;
    handleSelectedFile(f, fileType);
    e.currentTarget.value = '';
  }

  const uploading = statuses.some(s => s.status === 'uploading');
  const hasID = files.some(f => f.file_type === 'ID_PHOTO');
  const hasAddress = files.some(f => f.file_type === 'ADDRESS_PHOTO');
  const nextDisabled = uploading || !(hasID && hasAddress);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Documentos de respaldo</h2>

      <div className="grid grid-cols-1 gap-4">
        {/* ID upload block */}
        <div className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="font-semibold">Foto de Identificación (INE / licencia)</div>
            <div className="text-sm text-gray-600">Suba una foto legible o tome una con la cámara frontal.</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => idInputRef.current?.click()}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
            >
              Tomar / Subir ID
            </button>

            <input
              ref={idInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => onSelect(e, 'ID_PHOTO')}
              className="hidden"
            />
          </div>

          <div className="flex gap-2 flex-wrap mt-3 md:mt-0">
            {files.filter(f => f.file_type === 'ID_PHOTO').map(f => (
              <div key={f.idfiles} className="relative">
                {/* use authenticated stream endpoint for preview */}
                <img src={`${apiUrl}/media/${f.idfiles}`} alt="id" className="h-24 w-24 object-cover rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Address upload block */}
        <div className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="font-semibold">Comprobante de domicilio (recibo electricidad/agua)</div>
            <div className="text-sm text-gray-600">Suba foto del recibo o tome una foto con la cámara trasera.</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => addressInputRef.current?.click()}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
            >
              Tomar / Subir comprobante
            </button>

            <input
              ref={addressInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => onSelect(e, 'ADDRESS_PHOTO')}
              className="hidden"
            />
          </div>

          <div className="flex gap-2 flex-wrap mt-3 md:mt-0">
            {files.filter(f => f.file_type === 'ADDRESS_PHOTO').map(f => (
              <div key={f.idfiles} className="relative">
                <img src={`${apiUrl}/media/${f.idfiles}`} alt="address" className="h-24 w-24 object-cover rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* upload statuses (progress & errors) */}
        {statuses.length > 0 && (
          <div className="space-y-2">
            {statuses.map(s => (
              <div key={s.tempId} className="flex items-center gap-3 p-2 border rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-gray-600">{s.fileType}</div>
                  <div className="w-full bg-gray-200 rounded h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 ${s.status === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                </div>
                <div className="w-28 text-right text-xs">
                  {s.status === 'uploading' && <span className="text-blue-600">Subiendo {s.progress}%</span>}
                  {s.status === 'done' && <span className="text-green-600">Listo</span>}
                  {s.status === 'error' && <span className="text-red-600">Error: {s.error}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {onPrev && (
          <button onClick={onPrev} className="px-4 py-2 bg-gray-200 rounded">
            Anterior
          </button>
        )}

        <div className="flex-1" />

        {onNext && (
          <button
            onClick={onNext}
            className={`px-4 py-2 rounded text-white ${nextDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={nextDisabled}
            title={uploading ? 'Espere a que terminen las subidas' : (!hasID || !hasAddress ? 'Se requiere ID y comprobante' : 'Siguiente')}
          >
            {uploading ? 'Subiendo...' : 'Finalizar'}
          </button>
        )}
      </div>
    </div>
  );
}