import { render, RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import '@testing-library/jest-dom/vitest';

const customRender = (ui: ReactElement, options?: RenderOptions) => render(ui, options);

export * from '@testing-library/react';
export { customRender as render };
