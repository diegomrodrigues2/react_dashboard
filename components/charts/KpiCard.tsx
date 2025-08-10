
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
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
}) => {
  const changeColor = changeType === 'positive' ? 'text-green-500' : changeType === 'negative' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      {change && (
        <p className="mt-2 text-sm text-gray-500">
          <span className={`font-semibold ${changeColor}`}>{change}</span>
          {description && <span className="ml-1">{description}</span>}
        </p>
      )}
    </div>
  );
};

export default KpiCard;
