import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import SignUp from '../src/components/SignUp.jsx';

jest.mock('axios');

describe('SignUp Component', () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  // Unit Tests
  test('renders without crashing', () => {
    render(<SignUp />);
  });

  test('displays all form fields', () => {
    render(<SignUp />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /terms and conditions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('form fields are empty initially', () => {
    render(<SignUp />);
    expect(screen.getByLabelText(/full name/i).value).toBe('');
    expect(screen.getByLabelText(/email address/i).value).toBe('');
    expect(screen.getByLabelText(/^password$/i).value).toBe('');
    expect(screen.getByLabelText(/confirm password/i).value).toBe('');
    expect(screen.getByRole('checkbox', { name: /terms and conditions/i }).checked).toBe(false);
  });

  test('can type into input fields', () => {
    render(<SignUp />);
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
  });


  test('shows error when submitting empty form', async () => {
    render(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });

  test('shows error when password is too short', async () => {
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

 test('shows error when passwords do not match', async () => {
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    // Target specific labels
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('shows success message on successful registration', async () => {
    axios.post.mockResolvedValue({ data: {} });
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/registration successful/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument();
    });
  });

  // Integration Tests
  test('makes API call with correct data on valid submission', async () => {
    axios.post.mockResolvedValue({ data: {} });
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8090/api/auth/register', {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });
  });

  test('shows loading state during API call', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100)));
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText(/registration successful/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    axios.post.mockRejectedValue(new Error('Registration failed'));
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });
});