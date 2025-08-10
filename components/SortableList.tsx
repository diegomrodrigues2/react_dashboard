import React, { useState } from 'react';

interface SortableListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  disabled?: boolean;
}

function SortableList<T extends { id: string }>({
  items,
  onChange,
  renderItem,
  disabled = false,
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => () => {
    if (disabled) return;
    setDragIndex(index);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...items];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setDragIndex(index);
    onChange(updated);
  };

  const handleDragEnd = () => {
    if (disabled) return;
    setDragIndex(null);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={(item as any).id || index}
          data-testid="sortable-item"
          draggable={!disabled}
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDragEnd={handleDragEnd}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default SortableList;
