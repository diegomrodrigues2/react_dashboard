
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FocusTrap from 'focus-trap-react';
import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'modal' });

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      modalRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submittedData: Partial<DataItem> = { ...formData };
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      // @ts-ignore
      const value = formData[field.name];
      if (field.required && (value === '' || value === undefined || value === null)) {
        newErrors[field.name] = 'Campo obrigatório';
      }
      if (field.type === 'number' && typeof value === 'string' && value.trim() !== '') {
        // @ts-ignore
        submittedData[field.name] = parseFloat(value);
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      const el = modalRef.current?.querySelector<HTMLElement>(`#${firstErrorField}`);
      el?.focus();
      return;
    }

    setErrors({});
    onSubmit(submittedData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setDragOffset(prev => ({ x: prev.x + delta.x, y: prev.y + delta.y }));
  };

  // Expose for tests
  if (process.env.NODE_ENV === 'test') {
    // @ts-ignore
    (window as any).__modalDragEnd = handleDragEnd;
  }

  if (!isVisible) return null;

  const renderInput = (field: FieldConfig) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      // @ts-ignore
      value: formData[field.name] ?? '',
      onChange: handleChange,
      required: field.required,
      className: `mt-1 block w-full px-3 py-2 bg-white text-gray-900 border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#00A3E0] focus:border-[#00A3E0] sm:text-sm placeholder-gray-400`,
      'aria-invalid': !!errors[field.name],
      'aria-describedby': errors[field.name] ? `${field.name}-error` : undefined,
    } as const;

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
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <DndContext onDragEnd={handleDragEnd}>
        <FocusTrap active={isOpen} focusTrapOptions={{ fallbackFocus: '#modal-content' }}>
          <div
            id="modal-content"
            tabIndex={-1}
            ref={combinedRef}
            data-testid="modal-content"
            style={{
              transform: `translate3d(${dragOffset.x + (transform?.x ?? 0)}px, ${dragOffset.y + (transform?.y ?? 0)}px, 0)`,
            }}
            className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transition-transform transition-opacity duration-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
        <div
          {...listeners}
          {...attributes}
          data-testid="modal-header"
          className="flex justify-between items-center mb-4 cursor-move"
        >
          <h2 id="modal-title" className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Fechar modal">
            <XIcon title="Fechar" className="w-6 h-6" />
          </button>
        </div>
        {bodyContent ? (
          <div>{bodyContent}</div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderInput(field)}
                  {errors[field.name] && (
                    <p id={`${field.name}-error`} className="mt-1 text-sm text-red-600">
                      {errors[field.name]}
                    </p>
                  )}
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
      </DndContext>
    </div>
  );
};

export default Modal;