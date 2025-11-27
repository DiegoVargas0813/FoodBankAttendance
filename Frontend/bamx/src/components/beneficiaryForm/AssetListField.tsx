import { useEffect, useMemo } from 'react';
import type { FormField } from './formSchema';

type Props = {
  field: FormField; // will use field.options for list of assets
  value: Record<string, { has: boolean; functional: boolean }> | undefined;
  onChange: (val: Record<string, { has: boolean; functional: boolean }>) => void;
};

const AssetListField = ({ field, value = {}, onChange }: Props) => {
  const options = field.options || [];

  // build a default map with all options present (has=false, functional=false)
  const defaultMap = useMemo(
    () =>
      options.reduce<Record<string, { has: boolean; functional: boolean }>>((acc, opt) => {
        acc[opt.value] = { has: false, functional: false };
        return acc;
      }, {}),
    [options]
  );

  // ensure parent always receives an object that includes every known asset key.
  // This avoids missing keys in the saved JSON (so export shows "No" when not checked).
  useEffect(() => {
    const hasMissing = options.some(opt => !(opt.value in (value || {})));
    if (hasMissing) {
      // merge existing values over defaults so we don't lose user selections
      const merged = { ...defaultMap, ...(value || {}) };
      onChange(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const setAsset = (key: string, patch: Partial<{ has: boolean; functional: boolean }>) => {
    const next = { ...(value || {}) };
    const prev = next[key] || { has: false, functional: false };
    const updated = { ...prev, ...patch };
    // if has becomes false, ensure functional is false
    if (patch.has === false) updated.functional = false;
    next[key] = updated;
    onChange(next);
  };

  if (options.length === 0) return null;

  return (
    <div className="space-y-3">
      {options.map(opt => {
        const asset = value[opt.value] || { has: false, functional: false };
        return (
          <div
            key={opt.value}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b pb-2 last:border-b-0"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{opt.label}</div>
              {/*opt.description && <div className="text-xs text-gray-500">{opt.description}</div>*/}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  aria-label={`Tiene ${opt.label}`}
                  type="checkbox"
                  checked={!!asset.has}
                  onChange={e => setAsset(opt.value, { has: e.target.checked })}
                  className="h-5 w-5 rounded focus:ring-2 focus:ring-offset-1"
                />
                <span className="text-sm">Tiene</span>
              </label>

              <label className={`flex items-center gap-2 ${!asset.has ? 'opacity-50' : ''}`}>
                <input
                  aria-label={`Funciona ${opt.label}`}
                  type="checkbox"
                  checked={!!asset.functional}
                  disabled={!asset.has}
                  onChange={e => setAsset(opt.value, { functional: e.target.checked })}
                  className="h-5 w-5 rounded focus:ring-2 focus:ring-offset-1"
                />
                <span className={`text-sm ${!asset.has ? 'text-gray-400' : ''}`}>Funciona</span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetListField;