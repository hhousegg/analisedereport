
import React from 'react';
import { SlaThresholds } from '../types';

interface SlaConfigProps {
  thresholds: SlaThresholds;
  onChange: (newSlas: SlaThresholds) => void;
}

const SlaConfig: React.FC<SlaConfigProps> = ({ thresholds, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...thresholds,
      [name]: value === '' ? 0 : parseFloat(value),
    });
  };

  const slaFields = [
    { name: 'sdwan', label: 'SLA para "SD-WAN" (%)' },
    { name: 'wan1', label: 'SLA para "wan1 / wan" (%)' },
    { name: 'wan2', label: 'SLA para "wan2 / a" (%)' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-brand-secondary">1. Definir Limiares de SLA</h2>
      <p className="text-gray-400 mb-6">Defina os valores mínimos de disponibilidade. Os valores padrão podem ser ajustados.</p>
      <div className="space-y-4">
        {slaFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-1">
              {field.label}
            </label>
            <div className="relative">
              <input
                type="number"
                id={field.name}
                name={field.name}
                value={thresholds[field.name as keyof SlaThresholds]}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full bg-gray-dark border border-gray-light rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                placeholder="Ex: 99.95"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlaConfig;