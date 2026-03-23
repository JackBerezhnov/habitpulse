import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HabitType from './HabitType';

describe('HabitType', () => {
  it('renders Strength badge with error styling', () => {
    render(<HabitType Type="Strength" />);
    const badge = screen.getByText('Strength');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('badge-error');
  });

  it('renders Inteligent badge with info styling', () => {
    render(<HabitType Type="Inteligent" />);
    const badge = screen.getByText('Inteligent');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('badge-info');
  });

  it('renders Agility badge with accent styling', () => {
    render(<HabitType Type="Agility" />);
    const badge = screen.getByText('Agility');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('badge-accent');
  });

  it('renders nothing for unknown type', () => {
    const { container } = render(<HabitType Type="Unknown" />);
    expect(container.innerHTML).toBe('');
  });
});
