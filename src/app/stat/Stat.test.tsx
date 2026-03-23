import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Stat from './Stat';

describe('Stat', () => {
  it('renders Strength stat with correct value', () => {
    render(<Stat stat={15} statType="Strength" />);
    expect(screen.getByText('💪 Strength')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders Agility stat with correct value', () => {
    render(<Stat stat={8} statType="Agility" />);
    expect(screen.getByText('⚡ Agility')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders Intelligence stat with correct value', () => {
    render(<Stat stat={12} statType="Inteligent" />);
    expect(screen.getByText('🧠 Intelligence')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders nothing for unknown stat type', () => {
    const { container } = render(<Stat stat={5} statType="Unknown" />);
    expect(container.innerHTML).toBe('');
  });
});
