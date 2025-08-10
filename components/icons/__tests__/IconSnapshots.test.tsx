import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ArrowLeftOnRectangleIcon from '../ArrowLeftOnRectangleIcon';
import ChartPieIcon from '../ChartPieIcon';
import XIcon from '../XIcon';

describe('Icon snapshots', () => {
  it('ArrowLeftOnRectangleIcon matches snapshot', () => {
    const { container } = render(<ArrowLeftOnRectangleIcon aria-label="logout" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('ChartPieIcon matches snapshot', () => {
    const { container } = render(<ChartPieIcon aria-label="chart" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('XIcon matches snapshot', () => {
    const { container } = render(<XIcon aria-label="close" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
