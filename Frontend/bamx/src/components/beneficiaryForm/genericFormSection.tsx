import type { FormSection } from './formSchema';

import FieldRenderer from './FieldRenderer';

type Props = {
  section: FormSection;
  data: Record<string, any>;
  onChange: (data: Partial<Record<string, any>>) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

//Generic component to render form sections based on schema
const GenericFormSection = ({ section, data, onChange, onNext, onPrev }: Props) => {
//@ts-ignore
const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // For checkboxes with options
    const field = section.fields.find(f => f.name === name);
    // If the type is checkbox and has options, handle exclusive and group logic
    if (field?.type === 'checkbox' && field.options){
        //Array of currently selected options
        let current = Array.isArray(data[name]) ? data[name] : [];
        const option = field.options.find(opt => opt.value === value);

         //If the option is a  "none" option, clear all other selections
        if(option?.exclusive){
            onChange({ [name]: [value] });
            return;
        }

        //If any exlusive option is selected, ignore other selections
        // If any exclusive option is already selected, remove it
        const exclusiveOption = field.options.find(opt => opt.exclusive);
        if (exclusiveOption && current.includes(exclusiveOption.value)) {
            current = current.filter(v => v !== exclusiveOption.value);
        }

        // Handle group exclusivity
        if (option?.group) {
            // Remove any other selected options from the same group
            const groupValues = field.options.filter(opt => opt.group === option.group).map(opt => opt.value);
            current = current.filter(v => !groupValues.includes(v));
        }

        // Add or remove the clicked value
        if (checked) {
            current.push(value);
        } else {
            current = current.filter(v => v !== value);
        }

        onChange({ [name]: current });
        return;
    }

   

    onChange({ [name]: type === 'checkbox' ? checked : value });
  };


    return (
        <form
            onSubmit={e => {
            e.preventDefault();
            onNext?.();
        }}
        className="space-y-4"
        >
        {/* Section title */}
        <h2 className="text-xl font-bold mb-2">{section.title}</h2>
        {/* Render each field in the section */}
        {section.fields.map(field => (
              <div key={field.name}>
                <label>{field.label}</label>
                <FieldRenderer
                    field={field}
                    value={data[field.name]}
                    onChange={val => onChange({ [field.name]: val })}
                />
            </div>
        ))}
        <div className="flex gap-2 mt-4">
            {onPrev && <button type="button" onClick={onPrev} className="bg-gray-300 px-4 py-2 rounded">Anterior</button>}
            {onNext && <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Siguiente</button>}
        </div>
        </form>
    );
};

export default GenericFormSection;