import React, { useState } from 'react';

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

const FamilyMembersSection = ({members, onChange, onNext, onPrev}: Props) => {
    //Collapsed state for each member section
    const [collapsed, setCollapsed] = useState<boolean[]>(members.map(() => false));

    //Collapsed subsection
    const [subCollapsed, setSubCollapsed] = useState(
        members.map(() => ({
            general: false,
            employment: true,
            health: true
        }))
    )

    React.useEffect(() => {
        setCollapsed(prev =>
            members.length > prev.length
                ? [...prev, false] // Add a new collapsed state for the new member
                : prev.slice(0, members.length) // Remove extra collapsed states if members were removed
        );
        setSubCollapsed(prev =>
            members.length > prev.length
                ? [...prev, { general: false, employment: true, health: true }] // Add a new subCollapsed object
                : prev.slice(0, members.length) // Remove extra subCollapsed objects if members were removed
        );
    }, [members.length]);

    const toggleCollapse =(idx: number) => {
        setCollapsed(prev => prev.map((c, i) => i === idx ? !c : c))
    };

    const toggleSubCollapse = (idx: number, key: keyof typeof subCollapsed[0]) => {
        setSubCollapsed(prev =>
            prev.map((obj, i) => 
                i === idx ? {...obj, [key]: !obj[key]} : obj
            )
        )
    }

    //Add a new empty member
    const addMember = () => onChange([...members, {}]);

    // Remove a member by index
    const removeMember = (idx: number) => onChange(members.filter((_, i) => i !== idx));

    //Update a member's field
    const updateMember = (idx: number, data: any) => {
        // Update the specific member
        const updated = members.map((m, i) => i === idx ? {...m, ...data} : m);
        onChange(updated);
    };


    return(
        <form
            onSubmit={e => {e.preventDefault(); onNext?.();}}
            className="space-y-4"
        >
            <h2 className="text-xl font-bold mb-2">Estructura Familiar</h2>
            {members.map((member, idx) => (
            <div key={idx} className="border p-4 mb-4 rounded bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                    <span className="font-semibold">Miembro #{idx + 1}</span>
                    <button
                        type="button"
                        onClick={() => toggleCollapse(idx)}
                        className="text-blue-500 hover:underline"
                    >
                        {collapsed[idx] ? 'Mostrar' : 'Ocultar'}
                    </button>
                    </div>
                    <button
                    type="button"
                    onClick={() => removeMember(idx)}
                    className="text-red-500 hover:underline"
                    >
                    Eliminar
                    </button>
                </div>
                {!collapsed[idx] && (
                    <>
                    <CollapsibleSection
                        title="Datos Generales"
                        collapsed={subCollapsed[idx].general}
                        onToggle={() => toggleSubCollapse(idx, 'general')}
                    >
                        {familyMemberGeneralFields.map(field => (
                        <div key={field.name} className="mb-2">
                            <label>{field.label}</label>
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
                        collapsed={subCollapsed[idx].employment}
                        onToggle={() => toggleSubCollapse(idx, 'employment')}
                    >
                        {familyMemberEmploymentEducationFields.map(field => (
                        <div key={field.name} className="mb-2">
                            <label>{field.label}</label>
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
                        collapsed={subCollapsed[idx].health}
                        onToggle={() => toggleSubCollapse(idx, 'health')}
                    >
                        {familyMemberHealthFields.map(field => (
                        <div key={field.name} className="mb-2">
                            <label>{field.label}</label>
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