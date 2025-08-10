import { useState } from 'react';

interface UseEditable {
  isEditing: boolean;
  showTrendline: boolean;
  startEdit: () => void;
  stopEdit: () => void;
  toggleTrendline: () => void;
}

export default function useEditable(
  initial: boolean = false,
  initialTrendline: boolean = false
): UseEditable {
  const [isEditing, setIsEditing] = useState(initial);
  const [showTrendline, setShowTrendline] = useState(initialTrendline);

  const startEdit = () => setIsEditing(true);
  const stopEdit = () => setIsEditing(false);
  const toggleTrendline = () => setShowTrendline((prev) => !prev);

  return { isEditing, startEdit, stopEdit, showTrendline, toggleTrendline };
}
