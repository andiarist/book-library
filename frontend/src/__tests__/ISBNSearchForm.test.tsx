import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ISBNSearchForm } from '@/components/ISBNSearchForm';

describe('ISBNSearchForm', () => {
  it('should render form with input and button', () => {
    const mockOnSearch = vi.fn();
    render(<ISBNSearchForm onSearch={mockOnSearch} />);

    expect(screen.getByLabelText(/isbn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('should call onSearch with ISBN when form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnSearch = vi.fn();
    render(<ISBNSearchForm onSearch={mockOnSearch} />);

    const input = screen.getByLabelText(/isbn/i);
    const button = screen.getByRole('button', { name: /buscar/i });

    await user.type(input, '9780123456789');
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('9780123456789');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('should not call onSearch with empty ISBN', async () => {
    const user = userEvent.setup();
    const mockOnSearch = vi.fn();
    render(<ISBNSearchForm onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /buscar/i });
    await user.click(button);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should trim whitespace from ISBN', async () => {
    const user = userEvent.setup();
    const mockOnSearch = vi.fn();
    render(<ISBNSearchForm onSearch={mockOnSearch} />);

    const input = screen.getByLabelText(/isbn/i);
    const button = screen.getByRole('button', { name: /buscar/i });

    await user.type(input, '  9780123456789  ');
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('9780123456789');
  });

  it('should disable input and button when loading', () => {
    const mockOnSearch = vi.fn();
    render(<ISBNSearchForm onSearch={mockOnSearch} loading={true} />);

    const input = screen.getByLabelText(/isbn/i);
    const button = screen.getByRole('button', { name: /buscando/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should show loading text when loading', () => {
    const mockOnSearch = vi.fn();
    render(<ISBNSearchForm onSearch={mockOnSearch} loading={true} />);

    expect(
      screen.getByRole('button', { name: /buscando/i })
    ).toBeInTheDocument();
  });
});
