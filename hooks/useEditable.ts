import { useState } from 'react';

interface UseEditable {
  isEditing: boolean;
  startEdit: () => void;
  stopEdit: () => void;
}

export default function useEditable(initial: boolean = false): UseEditable {
  const [isEditing, setIsEditing] = useState(initial);

  const startEdit = () => setIsEditing(true);
  const stopEdit = () => setIsEditing(false);

  return { isEditing, startEdit, stopEdit };
}
