import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import React, { createContext, useContext, useState } from 'react';

interface ItemWithId {
  id: string;
}

interface SortableListContextValue<T extends ItemWithId> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

const SortableListContext = createContext<SortableListContextValue<any> | undefined>(undefined);

export function SortableList<T extends ItemWithId>({
  items: initialItems,
  children,
}: {
  items: T[];
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<T[]>(initialItems);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <SortableListContext.Provider value={{ items, setItems }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </SortableListContext.Provider>
  );
}

export function useSortableList<T extends ItemWithId>() {
  const context = useContext(SortableListContext);
  if (!context) {
    throw new Error('useSortableList must be used within a SortableList');
  }
  return context as SortableListContextValue<T>;
}

export function useSortableItem(id: string) {
  return useSortable({ id });
}

