# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Drag-and-drop utilities

`utils/dnd.ts` exposes a reusable `SortableList` component and type-safe
hooks for reordering collections.

```tsx
import { SortableList, useSortableList, useSortableItem } from './utils/dnd';

interface MenuItem { id: string; label: string }

export function Menu({ items }: { items: MenuItem[] }) {
  return (
    <SortableList items={items}>
      <MenuItems />
    </SortableList>
  );
}

function MenuItems() {
  const { items } = useSortableList<MenuItem>();
  return (
    <ul>
      {items.map((item) => {
        const { attributes, listeners, setNodeRef } = useSortableItem(item.id);
        return (
          <li key={item.id} ref={setNodeRef} {...attributes} {...listeners}>
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}
```

Wrap your rows or menu items in `SortableList` and access the ordered
values via `useSortableList`. Apply the props from `useSortableItem` to
each element to make it draggable.
