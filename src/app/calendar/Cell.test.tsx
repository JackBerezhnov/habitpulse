import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Cell from './Cell';

describe('Cell', () => {
  it('renders children content', () => {
    render(<Cell>15</Cell>);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calls onClick when clicked and not disabled', () => {
    const handleClick = vi.fn();
    render(<Cell onClick={handleClick}>5</Cell>);

    fireEvent.click(screen.getByText('5'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Cell onClick={handleClick} isDisabled>
        5
      </Cell>,
    );

    fireEvent.click(screen.getByText('5'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies green styling for current day', () => {
    render(<Cell isCurrentDay>10</Cell>);
    const cell = screen.getByText('10');
    expect(cell.className).toContain('bg-green-500');
  });

  it('applies today styling when isToday and not isCurrentDay', () => {
    render(<Cell isToday>10</Cell>);
    const cell = screen.getByText('10');
    expect(cell.className).toContain('bg-blue-100');
  });

  it('applies disabled styling', () => {
    render(<Cell isDisabled>10</Cell>);
    const cell = screen.getByText('10');
    expect(cell.className).toContain('text-gray-400');
  });
});
