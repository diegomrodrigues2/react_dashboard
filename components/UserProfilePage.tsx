
import React from 'react';
import { UserData, ActivityLog, ColumnConfig } from '../types.ts';
import { ACTIVITY_LOG_COLUMNS } from '../constants.ts'; 

interface UserProfilePageProps {
  user: UserData; // Updated to new UserData type
  recentActivities: ActivityLog[];
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, recentActivities }) => {
  const activityColumns: ColumnConfig<ActivityLog>[] = ACTIVITY_LOG_COLUMNS;

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
          {renderDetailItem("Nome", user.name)}
          {renderDetailItem("Role", user.role.charAt(0).toUpperCase() + user.role.slice(1))} {/* Capitalize role */}
          {/* Other details like Team, Created At, Last Logon At are removed as they are not in the simplified UserData */}
        </dl>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Atividades Recentes</h2>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Nenhuma atividade recente.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activityColumns.map((col) => (
                    <th
                      key={col.header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map((activity, rowIndex) => (
                  <tr key={activity.id || rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                    {activityColumns.map((col) => (
                      <td key={`${col.accessor.toString()}-${activity.id || rowIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {col.render ? col.render(activity[col.accessor], activity) : String(activity[col.accessor] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;