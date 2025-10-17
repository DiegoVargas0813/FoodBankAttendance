import { useState } from 'react';
import { formSchema } from './formSchema';
import GenericFormSection from './genericFormSection';
import FamilyMembersSection from './FamilyMemberSection';

// Main Component to handle multi-step form
const BeneficiaryForm = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('beneficiaryForm');
    return saved ? JSON.parse(saved) : {};
  });

  //Merges new data with existing form data and saves to localStorage
  const handleSectionChange = (data: Partial<Record<string, any>>) => {
    setFormData(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('beneficiaryForm', JSON.stringify(updated));
      return updated;
    });
  };

  const section = formSchema[step];

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
          onNext={step < formSchema.length - 1 ? () => setStep(step + 1) : undefined}
          onPrev={step > 0 ? () => setStep(step - 1) : undefined}
        />
      ) : (
        <GenericFormSection
          section={section}
          data={formData}
          onChange={data => {
            handleSectionChange(data);
          }}
          onNext={step < formSchema.length - 1 ? () => setStep(step + 1) : undefined}
          onPrev={step > 0 ? () => setStep(step - 1) : undefined}
        />
      )}
    </div>
  );
};

export default BeneficiaryForm;