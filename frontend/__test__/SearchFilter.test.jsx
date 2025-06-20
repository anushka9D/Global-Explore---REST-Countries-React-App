import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/components/Home'; // Adjust this path if needed

describe('Home Component - Search Input', () => {
  test('search input updates on change', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Get the search input by its placeholder
    const searchInput = screen.getByPlaceholderText('Search for a country...');

    // Simulate typing into the input
    fireEvent.change(searchInput, { target: { value: 'Germany' } });

    // Assert that the input value updates correctly
    expect(searchInput.value).toBe('Germany');
  });
});
