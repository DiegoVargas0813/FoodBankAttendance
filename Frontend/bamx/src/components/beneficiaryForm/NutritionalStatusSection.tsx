import { useState, useEffect } from 'react';
import FieldRenderer from './FieldRenderer';
import { nutritionalAdultQuestions, nutritionalChildQuestions } from './formSchema';

type Props = {
  data: Record<string, any>;
  onChange: (data: Partial<Record<string, any>>) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

const defaultAnswers = (fields: { name: string }[], defaultValue = 'no') =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: defaultValue }), {} as Record<string,string>);

// returns true if any family member is under 18 (checks dob strings YYYY-MM-DD)
const hasMinor = (members: any[] = []) => {
  const now = new Date();
  return members.some(m => {
    if (!m?.dob) return false;
    const dob = new Date(m.dob);
    const age = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age < 18;
  });
};

export default function NutritionalStatusSection({ data = {}, onChange, onNext, onPrev }: Props) {
  const incoming = data.nutritionalStatus || {};

  // Adults default to 'no', children default to blank '' so they must be re-checked
  const initialAdults = { ...defaultAnswers(nutritionalAdultQuestions, 'no'), ...incoming };
  const initialChildren = { ...defaultAnswers(nutritionalChildQuestions, ''), ...incoming };

  const [answers, setAnswers] = useState<Record<string,string>>({ ...initialAdults, ...initialChildren });
  const [showChild, setShowChild] = useState<boolean>(hasMinor(data.familyMembers));

  // control whether child block is expanded on mobile; default collapsed on small screens
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  const [childExpanded, setChildExpanded] = useState<boolean>(!isMobile);

  // Keep showChild in sync with familyMembers; when minors are removed, clear child answers to blank
  useEffect(() => {
    const has = hasMinor(data.familyMembers);
    if (!has) {
      setAnswers(prev => {
        const next = { ...prev };
        nutritionalChildQuestions.forEach(f => { next[f.name] = ''; });
        return next;
      });
    }
    setShowChild(has);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data.familyMembers || [])]);

  // When viewport changes, set sensible default for childExpanded
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (ev: MediaQueryListEvent | MediaQueryList) => {
      setChildExpanded(!ev.matches);
    };
    // initialize
    setChildExpanded(!mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  // Persist answers to parent whenever they change
  useEffect(() => {
    onChange({ nutritionalStatus: answers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const setAnswer = (name: string, value: any) => {
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onNext?.(); }} className="space-y-6">
      <h2 className="text-xl font-bold">Estado Nutricional</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nutritionalAdultQuestions.map(f => (
          <div key={f.name} className="mb-2">
            <label className="block mb-1 text-sm md:text-base">{f.label}</label>
            <div>
              <FieldRenderer field={f} value={answers[f.name]} onChange={v => setAnswer(f.name, v)} />
            </div>
          </div>
        ))}
      </div>

      {showChild && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Preguntas sobre menores</h3>
            {/* toggle visible on small screens, hidden on desktop */}
            <button
              type="button"
              onClick={() => setChildExpanded(prev => !prev)}
              className="md:hidden text-sm text-blue-600 px-2 py-1 rounded"
              aria-expanded={childExpanded}
            >
              {childExpanded ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {/* Collapse on mobile (childExpanded controls visibility on small screens) */}
          <div className={childExpanded ? 'block' : 'hidden md:block'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nutritionalChildQuestions.map(f => (
                <div key={f.name} className="mb-2">
                  <label className="block mb-1 text-sm md:text-base">{f.label}</label>
                  <FieldRenderer field={f} value={answers[f.name]} onChange={v => setAnswer(f.name, v)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col md:flex-row gap-3 mt-4">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="w-full md:w-auto bg-gray-300 px-4 py-3 rounded text-sm"
          >
            Anterior
          </button>
        )}
        {onNext && (
          <button
            type="submit"
            className="w-full md:w-auto bg-blue-500 text-white px-4 py-3 rounded text-sm"
          >
            Siguiente
          </button>
        )}
      </div>
    </form>
  );
}