import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formSchema } from './formSchema';
import GenericFormSection from './genericFormSection';
import FamilyMembersSection from './FamilyMemberSection';
import EconomicConditionsSection from './EconomicConditionsSection';
import calculateEconomicTotals from './utils/calculateEconomicTotals';
import NutritionalStatusSection from './NutritionalStatusSection';
import HousingProofSection from './HousingProofSection';

// simple deep merge for plain objects (arrays replaced)
const deepMerge = (target: any, patch: any) => {
  if (!patch || typeof patch !== 'object') return patch;
  const out = Array.isArray(patch) ? patch.slice() : { ...(target || {}) };
  Object.keys(patch).forEach((key) => {
    const pVal = patch[key];
    const tVal = target ? target[key] : undefined;
    if (pVal && typeof pVal === 'object' && !Array.isArray(pVal)) {
      out[key] = deepMerge(tVal, pVal);
    } else {
      out[key] = pVal;
    }
  });
  return out;
};

const BeneficiaryForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [familyStatus, setFamilyStatus] = useState<string | null>(null);
  const allowedStatuses = ['pending', 'rejected'];
  const [statusLoading, setStatusLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('beneficiaryForm');
    if (!saved) return {};
    try {
      const parsed = JSON.parse(saved);
      // ensure economic totals are present on load
      if (parsed.economicConditions) {
        parsed.economicConditions = calculateEconomicTotals(parsed.economicConditions);
      }
      return parsed;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');
        if (!apiUrl || !token) {
          setFamilyStatus(null);
          setStatusLoading(false);
          return;
        }
        const res = await fetch(`${apiUrl}/family/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setFamilyStatus(null);
        } else {
          const json = await res.json();
          setFamilyStatus((json && json.status) ? String(json.status).toLowerCase() : null);
        }
      } catch (e) {
        console.error('Failed to fetch family status', e);
        setFamilyStatus(null);
      } finally {
        setStatusLoading(false);
      }
    })();
  }, []);
  
  // Merge new data deeply, compute economic totals if relevant, persist
  const handleSectionChange = (data: Partial<Record<string, any>>) => {
    setFormData(prev => {
      const merged = deepMerge(prev, data);
      if (merged.economicConditions) {
        merged.economicConditions = calculateEconomicTotals(merged.economicConditions);
      }
      localStorage.setItem('beneficiaryForm', JSON.stringify(merged));
      return merged;
    });
  };

  // Submit formData to backend for authenticated FAMILY user
  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      // Ensure economic totals computed
      const payload = {
        ...formData,
        economicConditions: formData.economicConditions ? calculateEconomicTotals(formData.economicConditions) : undefined,
      };

      const apiUrl = import.meta.env.VITE_API_URL || '';
      if (!apiUrl) throw new Error('VITE_API_URL not configured');

      const token = localStorage.getItem('token');
      if (!token) {
        // If no token, redirect to login or notify user
        alert('No authentication token found. Inicie sesión antes de enviar el formulario.');
        setIsSubmitting(false);
        navigate('/login');
        return;
      }

      const res = await fetch(`${apiUrl}/family/form`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ form_data: payload }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      // Success: clear local draft and optionally navigate or show message
      localStorage.removeItem('beneficiaryForm');
      alert('Formulario enviado correctamente.');
      // navigate to a confirmation or dashboard page
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      alert(`Error al enviar el formulario: ${err?.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // unified next handler: advance step or submit if last
  const goNext = () => {
    if (step < formSchema.length - 1) {
      setStep(step + 1);
    } else {
      // final step -> submit
      submitForm();
    }
  };

  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const section = formSchema[step];

  if (statusLoading) {
    return <div className="p-6">Cargando estado del formulario...</div>;
  }
  if (!allowedStatuses.includes(String(familyStatus || '').toLowerCase())) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="font-semibold">Formulario no disponible</p>
          <p className="mt-2 text-sm">
            Su solicitud está en estado "{familyStatus ?? 'desconocido'}" y no puede editar el formulario en este momento.
            Si necesita hacer cambios, contacte al equipo de soporte o espere la revisión.
          </p>
          <div className="mt-4">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded">Volver al panel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {section.key === 'familyMembers' ? (
        <FamilyMembersSection
          members={formData.familyMembers || []}
          onChange={members => {
            setFormData(prev => {
              const updated = { ...prev, familyMembers: members };
              localStorage.setItem('beneficiaryForm', JSON.stringify(updated));
              return updated;
            });
          }}
          onNext={goNext}
          onPrev={goPrev}
        />
      ) : section.key === 'economicConditions' ? (
        <EconomicConditionsSection
          data={formData}
          onChange={data => {
            handleSectionChange(data);
          }}
          onNext={goNext}
          onPrev={goPrev}
        />
      ) : section.key === 'nutritionalStatus' ? (
        <NutritionalStatusSection
          data={formData}
          onChange={data => {
            handleSectionChange(data);
          }}
          onNext={goNext}
          onPrev={goPrev}
        />
      ) : section.key === 'mediaFiles' ? (
        <HousingProofSection
          data={formData}
          onChange={(partial) => setFormData(prev => deepMerge(prev, partial))}
          onNext={goNext}
          onPrev={goPrev}
        />
      ) : (
        <GenericFormSection
          section={section}
          data={formData}
          onChange={data => {
            handleSectionChange(data);
          }}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}

      {/* optional footer for submission status */}
      <div className="mt-4 text-sm text-gray-600">
        {isSubmitting ? 'Enviando formulario...' : `Paso ${step + 1} de ${formSchema.length}`}
      </div>
    </div>
  );
};

export default BeneficiaryForm;