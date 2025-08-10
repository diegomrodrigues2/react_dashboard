# Edit Context

Provides shared editing state across components.

## `useEditable`

A hook that manages a boolean `isEditing` flag and exposes `startEdit` and `stopEdit` helpers.
It also tracks a `showTrendline` flag that can be toggled when editing charts.

```tsx
const { isEditing, startEdit, stopEdit, showTrendline, toggleTrendline } = useEditable();
```

## `EditProvider`

Wrap components with `EditProvider` to share editing state via context.

```tsx
import { EditProvider, useEdit } from '@/context/EditContext';

function SomeComponent() {
  const { isEditing, startEdit, stopEdit, showTrendline, toggleTrendline } = useEdit();
  // ...
}

function App() {
  return (
    <EditProvider>
      <SomeComponent />
    </EditProvider>
  );
}
```
