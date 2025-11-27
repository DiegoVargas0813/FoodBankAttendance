// ...existing code...
import { useState, useEffect } from 'react';

import CollapsibleSection from './CollapsibleSection';
import FieldRenderer from './FieldRenderer';

import {
    familyMemberGeneralFields,
    familyMemberEmploymentEducationFields,
    familyMemberHealthFields,
} from './formSchema';

type Props = {
  members: any[];
  onChange: (members: any[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

const defaultSubCollapsed = { general: false, employment: true, health: true };

// Helper to create a new empty member (extend with defaults if you want)
const createEmptyMember = (isHead = false) => ({
  // Minimal default: set relation to titular when requested
  relationship_to_head: isHead ? 'titular' : undefined,
});

const FamilyMembersSection = ({members = [], onChange, onNext, onPrev}: Props) => {
    // start local collapsed state as empty arrays; we will sync below
    const [collapsed, setCollapsed] = useState<boolean[]>([]);
    const [subCollapsed, setSubCollapsed] = useState<{general:boolean; employment:boolean; health:boolean}[]>([]);

    // Ensure there is always at least one member (the titular).
    useEffect(() => {
        if (!members || members.length === 0) {
            const initial = [createEmptyMember(true)];
            onChange(initial);
            // initialize local UI state for the single member
            const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
            setCollapsed([isMobile ? true : false]);
            setSubCollapsed([isMobile ? { general: true, employment: true, health: true } : { ...defaultSubCollapsed }]);
            return;
        }

        // If members already exist, keep collapse arrays in sync with their length.
        const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
        setCollapsed(prev => {
            if (prev.length === members.length) return prev;
            const next = members.map((_, i) => (typeof prev[i] === 'boolean' ? prev[i] : (isMobile ? true : false)));
            return next;
        });
        setSubCollapsed(prev => {
            if (prev.length === members.length) return prev;
            const next = members.map((_, i) => {
                const defaultState = isMobile ? { general: true, employment: true, health: true } : { ...defaultSubCollapsed };
                return prev[i] ? prev[i] : defaultState;
            });
            return next;
        });
    }, [members.length, onChange]);

    const toggleCollapse = (idx: number) => {
        setCollapsed(prev => prev.map((c, i) => i === idx ? !c : c));
    };

    const toggleSubCollapse = (idx: number, key: keyof typeof defaultSubCollapsed) => {
        setSubCollapsed(prev => prev.map((obj, i) => i === idx ? { ...obj, [key]: !obj[key] } : obj));
    };

    // Add a new empty member: update parent and local state immediately so UI updates without waiting parent re-render
    const addMember = () => {
        const newMembers = [...members, createEmptyMember(false)];
        // update parent
        onChange(newMembers);
        // update local UI immediately
        setCollapsed(prev => [...prev, false]);
        setSubCollapsed(prev => [...prev, { ...defaultSubCollapsed }]);
    };

    // Remove a member by index and update local arrays consistently.
    // Prevent removing the last member to enforce having a titular.
    const removeMember = (idx: number) => {
        if (members.length <= 1) {
            // Could show a UI toast instead of alert in your app
            alert('Debe existir al menos un miembro titular en la familia.');
            return;
        }
        const newMembers = members.filter((_, i) => i !== idx);
        onChange(newMembers);
        setCollapsed(prev => {
            const copy = [...prev];
            copy.splice(idx, 1);
            return copy;
        });
        setSubCollapsed(prev => {
            const copy = [...prev];
            copy.splice(idx, 1);
            return copy;
        });
    };

    // Update a member's fields and push to parent only
    const updateMember = (idx: number, data: any) => {
        const updated = members.map((m, i) => i === idx ? { ...m, ...data } : m);
        onChange(updated);
    };

    return (
        <form
            onSubmit={e => { e.preventDefault(); onNext?.(); }}
            className="space-y-4"
        >
            <h2 className="text-xl font-bold mb-2">Estructura Familiar</h2>

            {members.map((member, idx) => (
            <div key={idx} className="border p-4 mb-4 rounded bg-gray-50">
                {/* Mobile summary row: visible only on small screens */}
                <div className="flex items-center justify-between md:hidden mb-2">
                  <div>
                    <div className="font-semibold">
                      {member.first_name ? `${member.first_name} ${member.first_surname || ''}` : `Miembro ${idx+1}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.relationship_to_head ? member.relationship_to_head : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(idx)}
                      className="text-blue-500 px-3 py-1 rounded-md"
                      aria-expanded={!collapsed[idx]}
                    >
                      {collapsed[idx] ? 'Abrir' : 'Detalles'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className={`text-red-500 px-3 py-1 rounded-md ${members.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={members.length <= 1}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Desktop header + actions (hidden on small screens) */}
                <div className="hidden md:flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">
                            {member.first_name ? `${member.first_name} ${member.first_surname || ''}` : `Miembro ${idx+1}`}
                        </span>
                        <button
                            type="button"
                            onClick={() => toggleCollapse(idx)}
                            className="text-blue-500 hover:underline px-2 py-1 md:px-0"
                            aria-expanded={!collapsed[idx]}
                        >
                            {collapsed[idx] ? 'Mostrar' : 'Ocultar'}
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeMember(idx)}
                        className={`text-red-500 hover:underline px-2 py-1 md:px-0 ${members.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={members.length <= 1}
                    >
                        Eliminar
                    </button>
                </div>

                {/* Details: desktop visible or mobile when expanded */}
                {!collapsed[idx] && (
                    <>
                    <CollapsibleSection
                        title="Datos Generales"
                        collapsed={!!subCollapsed[idx]?.general}
                        onToggle={() => toggleSubCollapse(idx, 'general')}
                    >
                        {familyMemberGeneralFields.map(field => (
                        <div key={field.name} className="mb-2">
                            <label htmlFor={`${field.name}-${idx}`} className="block mb-1">{field.label}</label>
                            <FieldRenderer
                                field={field}
                                value={member[field.name]}
                                onChange={val => updateMember(idx, { [field.name]: val })}
                            />
                        </div>
                        ))}
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Empleo/Escolaridad"
                        collapsed={!!subCollapsed[idx]?.employment}
                        onToggle={() => toggleSubCollapse(idx, 'employment')}
                    >
                        {familyMemberEmploymentEducationFields.map(field => (
                        <div key={field.name} className="mb-2">
                            <label htmlFor={`${field.name}-${idx}`} className="block mb-1">{field.label}</label>
                            <FieldRenderer
                                field={field}
                                value={member[field.name]}
                                onChange={val => updateMember(idx, { [field.name]: val })}
                            />
                        </div>
                        ))}
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Salud"
                        collapsed={!!subCollapsed[idx]?.health}
                        onToggle={() => toggleSubCollapse(idx, 'health')}
                    >
                        {familyMemberHealthFields.map(field => (
                        <div key={field.name} className="mb-2">
                            <label htmlFor={`${field.name}-${idx}`} className="block mb-1">{field.label}</label>
                            <FieldRenderer
                                field={field}
                                value={member[field.name]}
                                onChange={val => updateMember(idx, { [field.name]: val })}
                            />
                        </div>
                        ))}
                    </CollapsibleSection>
                    </>
                )}
            </div>
            ))}

            <button type="button" onClick={addMember} className="bg-green-500 text-white px-4 py-2 rounded">Agregar miembro</button>
            <div className="flex gap-2 mt-4">
                {onPrev && <button type="button" onClick={onPrev} className="bg-gray-300 px-4 py-2 rounded">Anterior</button>}
                {onNext && <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Siguiente</button>}
            </div>
        </form>
    );
}

export default FamilyMembersSection;
// ...existing code...