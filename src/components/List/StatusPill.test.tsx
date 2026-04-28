import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('renders DL for downloading', () => {
    render(<StatusPill state="downloading" />);
    expect(screen.getByText('DL')).toBeInTheDocument();
  });
  it('renders SE for stalledUP', () => {
    render(<StatusPill state="stalledUP" />);
    expect(screen.getByText('SE')).toBeInTheDocument();
  });
  it('renders PA for pausedDL', () => {
    render(<StatusPill state="pausedDL" />);
    expect(screen.getByText('PA')).toBeInTheDocument();
  });
  it('renders ER for error', () => {
    render(<StatusPill state="error" />);
    expect(screen.getByText('ER')).toBeInTheDocument();
  });
});
