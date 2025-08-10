import React, { useState, useEffect } from 'react';
import { UserData, ActivityLog, ColumnConfig, DataItem, FieldConfig } from '../types.ts';
import { ACTIVITY_LOG_COLUMNS } from '../constants.ts';
import DataTable from './DataTable.tsx';
import Modal from './Modal.tsx';

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

  const [profile, setProfile] = useState<UserData>(user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`profile_${user.id}`);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [user.id]);

  const profileFields: FieldConfig<any>[] = [
    { name: 'name', label: 'Nome', type: 'text', required: true },
  ];
  if (profile.role === 'admin') {
    profileFields.push({ name: 'role', label: 'Role', type: 'select', options: ['admin', 'editor', 'viewer'], required: true });
  }

  const handleSaveProfile = (data: Partial<DataItem>) => {
    const updated = { ...profile, ...data } as UserData;
    setProfile(updated);
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(updated));
    setIsModalOpen(false);
  };

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Perfil do Usuário</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#00A3E0] hover:text-[#0082B8]"
          >
            Editar Perfil
          </button>
        </div>
        <dl className="divide-y divide-gray-200">
          {renderDetailItem('Nome', profile.name)}
          {renderDetailItem('Role', profile.role.charAt(0).toUpperCase() + profile.role.slice(1))}
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
            userRole={profile.role}
            enableDragAndDrop
            persistKey={`activity_order_${user.id}`}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProfile}
        title="Editar Perfil"
        fields={profileFields as FieldConfig[]}
        initialData={profile as unknown as Partial<DataItem>}
      />
    </div>
  );
};

export default UserProfilePage;

