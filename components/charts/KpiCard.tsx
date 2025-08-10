
import React, { useState } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  isLoading?: boolean;
  error?: string;
}

// Sample data for demonstration
const sampleData: KpiCardProps = {
  title: 'Vendas Totais',
  value: 'R$1.2M',
  change: '+5.4%',
  changeType: 'positive',
  description: 'em relação ao mês passado',
};

const KpiCard: React.FC<Partial<KpiCardProps>> = ({
  title = sampleData.title,
  value = sampleData.value,
  change = sampleData.change,
  changeType = sampleData.changeType,
  description = sampleData.description,
  isLoading = false,
  error,
}) => {
  const changeColor =
    changeType === 'positive'
      ? 'text-green-500'
      : changeType === 'negative'
      ? 'text-red-500'
      : 'text-gray-500';

  const [titleState, setTitleState] = useState(String(title));
  const [valueState, setValueState] = useState(String(value));
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingValue, setEditingValue] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [valueError, setValueError] = useState('');

  const commitTitle = () => {
    if (titleState.trim() === '') {
      setTitleError('Title is required');
      setTitleState(String(title));
    } else {
      setTitleError('');
    }
    setEditingTitle(false);
  };

  const commitValue = () => {
    if (valueState.trim() === '') {
      setValueError('Value is required');
      setValueState(String(value));
    } else {
      setValueError('');
    }
    setEditingValue(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg relative">
      <div className="drag-handle absolute top-1 left-1 cursor-move" aria-label="drag handle">⋮⋮</div>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <svg
            className="animate-spin h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center">{error}</p>
      ) : (
        <>
          {editingTitle ? (
            <input
              className="text-sm font-medium text-gray-500 truncate border-b border-gray-300"
              value={titleState}
              onChange={(e) => setTitleState(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
              autoFocus
            />
          ) : (
            <h3
              className="text-sm font-medium text-gray-500 truncate"
              onClick={() => setEditingTitle(true)}
            >
              {titleState}
            </h3>
          )}
          {titleError && (
            <p className="text-xs text-red-500 mt-1">{titleError}</p>
          )}
          {editingValue ? (
            <input
              className="mt-1 text-3xl font-semibold text-gray-900 border-b border-gray-300"
              value={valueState}
              onChange={(e) => setValueState(e.target.value)}
              onBlur={commitValue}
              onKeyDown={(e) => e.key === 'Enter' && commitValue()}
              autoFocus
            />
          ) : (
            <p
              className="mt-1 text-3xl font-semibold text-gray-900"
              onClick={() => setEditingValue(true)}
            >
              {valueState}
            </p>
          )}
          {valueError && (
            <p className="text-xs text-red-500 mt-1">{valueError}</p>
          )}
          {change && (
            <p className="mt-2 text-sm text-gray-500">
              <span className={`font-semibold ${changeColor}`}>{change}</span>
              {description && <span className="ml-1">{description}</span>}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default KpiCard;
