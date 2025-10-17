import React from 'react';
import type { FormField } from './formSchema';

type Props = {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
};

const FieldRenderer = ({ field, value, onChange }: Props) => {
  // Handler for all input types
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // @ts-ignore
    const { type, value: inputValue } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (field.type === 'checkbox' && field.options) {
      // Multi-checkbox logic (exclusive, group, etc.)
      let current = Array.isArray(value) ? value : [];
      const optionValue = e.target.value;
      const option = field.options.find(opt => opt.value === optionValue);

      if (option?.exclusive) {
        onChange([optionValue]);
        return;
      }
      const exclusiveOption = field.options.find(opt => opt.exclusive);
      if (exclusiveOption && current.includes(exclusiveOption.value)) {
        current = current.filter(v => v !== exclusiveOption.value);
      }
      if (option?.group) {
        const groupValues = field.options.filter(opt => opt.group === option.group).map(opt => opt.value);
        current = current.filter(v => !groupValues.includes(v));
      }
      if (checked) {
        current.push(optionValue);
      } else {
        current = current.filter(v => v !== optionValue);
      }
      onChange(current);
      return;
    }
    if (field.type === 'checkbox') {
      onChange(checked);
      return;
    }
    onChange(inputValue);
  };

  // Render logic
  if (field.type === 'text' || field.type === 'date' || field.type === 'number') {
    return (
      <input
        type={field.type}
        name={field.name}
        value={value || ''}
        onChange={handleInput}
        className="border p-2 w-full"
        required={field.required}
      />
    );
  }
  if (field.type === 'select' && field.options) {
    return (
      <select
        name={field.name}
        value={value || ''}
        onChange={handleInput}
        className="border p-2 w-full"
        required={field.required}
      >
        <option value="">Seleccione...</option>
        {field.options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }
  if (field.type === 'checkbox' && field.options) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {field.options.map(opt => (
          <label key={opt.value} className="flex items-center gap-1">
            <input
              type="checkbox"
              name={field.name}
              value={opt.value}
              checked={Array.isArray(value) ? value.includes(opt.value) : false}
              onChange={handleInput}
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }
  if (field.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        name={field.name}
        checked={!!value}
        onChange={handleInput}
        className="ml-2"
      />
    );
  }
  // Add more types as needed
  return null;
};

export default FieldRenderer;