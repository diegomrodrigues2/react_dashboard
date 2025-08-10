import { createContext, ReactNode, useContext } from 'react';
import useEditable from '../hooks/useEditable.ts';

interface EditContextValue {
  isEditing: boolean;
  showTrendline: boolean;
  startEdit: () => void;
  stopEdit: () => void;
  toggleTrendline: () => void;
}

const EditContext = createContext<EditContextValue | undefined>(undefined);

interface EditProviderProps {
  children: ReactNode;
}

export function EditProvider({ children }: EditProviderProps) {
  const editable = useEditable();

  return (
    <EditContext.Provider value={editable}>
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
}

export default EditContext;
