import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('HabitPulse')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Footer />);
    expect(screen.getByText('Build better habits, level up your life')).toBeInTheDocument();
  });

  it('renders the current year in the copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });
});
