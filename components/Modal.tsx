
import React, { useState, useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { FieldConfig, DataItem } from '../types.ts';
import XIcon from './icons/XIcon.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DataItem>) => void;
  title: string;
  fields?: FieldConfig[]; 
  initialData?: Partial<DataItem> | null;
  bodyContent?: React.ReactNode;
  submitButtonText?: string;
  submitButtonClassName?: string;
  cancelButtonText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields = [], 
  initialData,
  bodyContent,
  submitButtonText = "Salvar",
  submitButtonClassName = "bg-[#00A3E0] hover:bg-[#0082B8] focus:ring-[#00A3E0]",
  cancelButtonText = "Cancelar",
}) => {
  const [formData, setFormData] = useState<Partial<DataItem>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Ensure numbers are treated as numbers for number inputs, dates as YYYY-MM-DD strings
        const processedInitialData: Partial<DataItem> = {};
        fields.forEach(field => {
          // @ts-ignore
          const value = initialData[field.name];
           // @ts-ignore
          processedInitialData[field.name] = value;
        });
         // @ts-ignore
        setFormData(processedInitialData);
      } else {
        const emptyForm: Partial<DataItem> = {};
        fields.forEach(field => {
           // @ts-ignore
          emptyForm[field.name] = field.type === 'select' && field.options && field.options.length > 0 
            ? field.options[0] 
            : field.type === 'number' ? '' : ''; // Default for number can be empty or 0
        });
        setFormData(emptyForm);
      }
    }
  }, [isOpen, initialData, fields]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // For number fields, ensure value is stored appropriately or validated client-side.
    // HTML input type="number" returns string in `value`, but `valueAsNumber` can be used.
    // For simplicity here, we'll store as string and let backend/further logic parse.
    // Or, if strictly number is needed in frontend state:
    // const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Potentially parse numeric strings to numbers before submit if DataItem expects numbers
    const submittedData = { ...formData };
    fields.forEach(field => {
      if (field.type === 'number') {
        // @ts-ignore
        const value = formData[field.name];
        if (typeof value === 'string' && value.trim() !== '') {
            // @ts-ignore
          submittedData[field.name] = parseFloat(value);
        } else if (typeof value !== 'number') {
            // @ts-ignore
           submittedData[field.name] = undefined; // Or null, or handle as error
        }
      }
    });
    onSubmit(submittedData);
  };

  if (!isOpen) return null;

  const renderInput = (field: FieldConfig) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      // @ts-ignore
      value: formData[field.name] ?? '',
      onChange: handleChange,
      required: field.required,
      className: "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A3E0] focus:border-[#00A3E0] sm:text-sm placeholder-gray-400"
    };

    if (field.type === 'select' && field.options) {
      return (
        <select {...commonProps} value={formData[field.name as keyof DataItem] ?? (field.options[0] || '')}>
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'date') {
      return <input type="date" {...commonProps} />;
    }

    if (field.type === 'number') {
      return <input type="number" {...commonProps} step="any" />; // step="any" for decimals
    }

    // Default to text
    return <input type="text" {...commonProps} />;
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <FocusTrap active={isOpen}>
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Fechar modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {bodyContent ? (
          <div>{bodyContent}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderInput(field)}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {cancelButtonText}
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${submitButtonClassName}`}
              >
                {submitButtonText}
              </button>
            </div>
          </form>
        )}
        {/* Buttons for modals with bodyContent (no form submission needed from modal itself) */}
        {bodyContent && (
           <div className="mt-6 flex justify-end space-x-3">
           <button
             type="button"
             onClick={onClose}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
           >
             {cancelButtonText}
           </button>
           <button
             type="button" 
             onClick={() => onSubmit({})} 
             className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${submitButtonClassName}`}
           >
             {submitButtonText}
           </button>
         </div>
        )}
      </div>
      </FocusTrap>
    </div>
  );
};

export default Modal;