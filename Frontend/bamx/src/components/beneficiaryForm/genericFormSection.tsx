import type { FormSection, FormField } from './formSchema';
import FieldRenderer from './FieldRenderer';

type Props = {
  section: FormSection;
  data: Record<string, any>;
  onChange: (data: Partial<Record<string, any>>) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

const GenericFormSection = ({ section, data, onChange, onNext, onPrev }: Props) => {
  const handleFieldChange = (field: FormField, value: any) => {
    // title fields won't call onChange because FieldRenderer doesn't call it; safe to always merge
    onChange({ [field.name]: value });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onNext?.(); }} className="space-y-4">
      <h2 className="text-xl font-bold">{section.title}</h2>

      {section.fields.map(field => (
        <div key={field.name} className={field.type === 'title' ? '' : 'mb-3'}>
          {/* For title fields FieldRenderer renders a header and does not call onChange */}
          <label className={field.type === 'title' ? '' : 'block mb-1'}>
            {field.type !== 'title' && <span className="text-sm">{field.label}</span>}
          </label>
          <FieldRenderer
            field={field}
            value={data[field.name]}
            onChange={(val) => handleFieldChange(field, val)}
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