# Drag and Drop Helpers

Utilities for building drag-and-drop interactions using [`dnd-kit`](https://github.com/clauderic/dnd-kit).

## DraggableList

`DraggableList` renders a sortable list of items.

```tsx
import { DraggableList } from '@/components/dnd';

interface Item { id: string; label: string }

export function Example() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
  ]);

  return (
    <DraggableList
      items={items}
      onChange={setItems}
      getId={item => item.id}
      renderItem={item => <div>{item.label}</div>}
    />
  );
}
```
