import React from 'react';
import { UserData, ActivityLog, ColumnConfig, DataItem } from '../types.ts';
import { ACTIVITY_LOG_COLUMNS } from '../constants.ts';
import DataTable from './DataTable.tsx';

interface UserProfilePageProps {
  user: UserData;
  recentActivities: ActivityLog[];
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, recentActivities }) => {
  const activityColumns: ColumnConfig<ActivityLog>[] = ACTIVITY_LOG_COLUMNS;

  const activityData: DataItem[] = recentActivities.map(activity => ({
    id: activity.id,
    timestamp: activity.timestamp,
    action: activity.action,
    details: activity.details,
    targetTable: activity.targetTable ?? '',
  })) as unknown as DataItem[];

  const renderDetailItem = (label: string, value: string | string[]) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {Array.isArray(value) ? value.join(', ') : value}
      </dd>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Perfil do Usuário</h2>
        <dl className="divide-y divide-gray-200">
          {renderDetailItem('Nome', user.name)}
          {renderDetailItem('Role', user.role.charAt(0).toUpperCase() + user.role.slice(1))}
        </dl>
      </div>

      <div>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Nenhuma atividade recente.</p>
        ) : (
          <DataTable
            columns={activityColumns as unknown as ColumnConfig<DataItem>[]}
            data={activityData}
            onAddItem={() => {}}
            onEditItem={() => {}}
            onDeleteItem={() => {}}
            title="Atividades Recentes"
            userRole={user.role}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;

