import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('renders Down for downloading', () => {
    render(<StatusPill state="downloading" />);
    expect(screen.getByText('Down')).toBeInTheDocument();
  });
  it('renders Seed for stalledUP', () => {
    render(<StatusPill state="stalledUP" />);
    expect(screen.getByText('Seed')).toBeInTheDocument();
  });
  it('renders Pause for pausedDL', () => {
    render(<StatusPill state="pausedDL" />);
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });
  it('renders Error for error', () => {
    render(<StatusPill state="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
