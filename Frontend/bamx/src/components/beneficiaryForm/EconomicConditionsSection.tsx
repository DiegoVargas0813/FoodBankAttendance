import { useState, useEffect } from 'react';
import calculateEconomicTotals from './utils/calculateEconomicTotals';
import { economicWeeklyIncomeFields, economicWeeklyExpensesFields, formSchema } from './formSchema';
import FieldRenderer from './FieldRenderer';

type Props = {
  data?: any;
  onChange: (value: any) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

function formatCurrency(n?: number | string) {
  if (n === null || n === undefined || n === '') return '';
  const num = Number(n) || 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
}

export default function EconomicConditionsSection({ data = {}, onChange, onNext, onPrev }: Props) {
  // Merge incoming data with defaults (shallow for the two groups is enough here)
  const defaults = {
    weekly_income: economicWeeklyIncomeFields.reduce<Record<string, number>>((acc, f) => { acc[f.name] = 0; return acc; }, { weekly_total: 0, monthly_total: 0 }),
    weekly_expenses: economicWeeklyExpensesFields.reduce<Record<string, number>>((acc, f) => { acc[f.name] = 0; return acc; }, { weekly_total: 0, monthly_total: 0 }),
  };

  const initial = {
    // top-level fields defaults
    other_support: data.economicConditions?.other_support ?? '',
    provider_of_support: data.economicConditions?.provider_of_support ?? '',
    frequency_of_support: data.economicConditions?.frequency_of_support ?? '',
    has_remmittances: data.economicConditions?.has_remmittances ?? false,
    frequency: data.economicConditions?.frequency ?? '',
    curp: data.economicConditions?.curp ?? false,
    birth_certificate: data.economicConditions?.birth_certificate ?? false,
    id_card: data.economicConditions?.id_card ?? false,
    ine: data.economicConditions?.ine ?? false,
    // groups
    weekly_income: { ...(defaults.weekly_income as Record<string, number>), ...(data.economicConditions?.weekly_income || {}) },
    weekly_expenses: { ...(defaults.weekly_expenses as Record<string, number>), ...(data.economicConditions?.weekly_expenses || {}) },
  };

  type FullEconomic = {
    other_support: string;
    provider_of_support: string;
    frequency_of_support: string;
    has_remmittances: boolean;
    frequency: string;
    curp: boolean;
    birth_certificate: boolean;
    id_card: boolean;
    ine: boolean;
    weekly_income: Record<string, number>;
    weekly_expenses: Record<string, number>;
  };

  const [econ, setEcon] = useState<FullEconomic>(() => calculateEconomicTotals(initial) as unknown as FullEconomic);

  // Notify parent whenever computed econ changes
  useEffect(() => {
    onChange({ economicConditions: econ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [econ]);

  const setTopField = (name: string, value: any) => {
    setEcon(prev => {
      const next = { ...prev, [name]: value };
      return calculateEconomicTotals(next) as unknown as FullEconomic;
    });
  };

  const setField = (path: 'weekly_income' | 'weekly_expenses', key: string, raw: string) => {
    const digitsOnly = String(raw).replace(/\D+/g, '');
    const value = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
    setEcon(prev => {
      const next = {
        ...prev,
        [path]: {
          ...(prev[path] || {}),
          [key]: value,
        },
      };
      return calculateEconomicTotals(next) as unknown as FullEconomic;
    });
  };

  const econSection = formSchema.find(s => s.key === 'economicConditions');
  const topFields = econSection?.fields || [];

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onNext?.(); }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold">Condiciones Económicas</h2>

      <div className="space-y-3">
        {topFields.map(field => {
          if (field.type === 'title') {
            return <FieldRenderer key={field.name} field={field} value={undefined} onChange={() => {}} />;
          }
          return (
            <div key={field.name} className="mb-2">
              <label className="block mb-1 text-sm md:text-base">{field.label}</label>
              <FieldRenderer
                field={field}
                value={(econ as any)[field.name]}
                onChange={val => setTopField(field.name, val)}
              />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Ingresos Semanales</h3>
          <div className="space-y-3">
            {economicWeeklyIncomeFields.map(field => (
              <label key={field.name} className="flex flex-col">
                <span className="text-sm md:text-base mb-1">{field.label}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={String(econ.weekly_income?.[field.name] ?? 0)}
                  onChange={e => setField('weekly_income', field.name, e.target.value)}
                  className="border p-3 rounded w-full text-right"
                  aria-label={field.label}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 border-t pt-3 text-sm md:text-base">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total semanal</span>
              <span className="font-semibold">{formatCurrency(econ.weekly_income?.weekly_total)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">Total mensual</span>
              <span className="font-semibold">{formatCurrency(econ.weekly_income?.monthly_total)}</span>
            </div>
          </div>
        </section>

        <section className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Gastos Semanales</h3>
          <div className="space-y-3">
            {economicWeeklyExpensesFields.map(field => (
              <label key={field.name} className="flex flex-col">
                <span className="text-sm md:text-base mb-1">{field.label}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={String(econ.weekly_expenses?.[field.name] ?? 0)}
                  onChange={e => setField('weekly_expenses', field.name, e.target.value)}
                  className="border p-3 rounded w-full text-right"
                  aria-label={field.label}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 border-t pt-3 text-sm md:text-base">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total semanal</span>
              <span className="font-semibold">{formatCurrency(econ.weekly_expenses?.weekly_total)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">Total mensual</span>
              <span className="font-semibold">{formatCurrency(econ.weekly_expenses?.monthly_total)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mt-4">
        {onPrev && (
          <button type="button" onClick={onPrev} className="w-full md:w-auto bg-gray-300 px-4 py-3 rounded text-sm">
            Anterior
          </button>
        )}
        {onNext && (
          <button type="submit" className="w-full md:w-auto bg-blue-500 text-white px-4 py-3 rounded text-sm">
            Siguiente
          </button>
        )}
      </div>
    </form>
  );
}