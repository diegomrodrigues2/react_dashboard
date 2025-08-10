
import React from 'react';

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
  const changeColor = changeType === 'positive' ? 'text-green-500' : changeType === 'negative' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
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
          <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
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
