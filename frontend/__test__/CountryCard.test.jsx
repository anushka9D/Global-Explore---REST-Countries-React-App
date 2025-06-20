import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/components/Home';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        name: { common: 'United States', official: 'United States of America' },
        population: 331002651,
        region: 'Americas',
        subregion: 'North America',
        capital: ['Washington, D.C.'],
        languages: { eng: 'English' },
        flags: { png: 'us-flag.png', svg: 'us-flag.svg' },
        cca3: 'USA',
      }
    ]),
  })
);

describe('Home Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('loads and displays countries', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    // Wait for the country card to appear
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Population:')).toBeInTheDocument();
    expect(screen.getByText('Region:')).toBeInTheDocument();
    expect(screen.getByText('Americas')).toBeInTheDocument();
  });

  it('displays country details when View Details button is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    // Wait for the country card to appear
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    // Mock the detailed country fetch response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            name: { common: 'United States', official: 'United States of America' },
            population: 331002651,
            region: 'Americas',
            subregion: 'North America',
            capital: ['Washington, D.C.'],
            languages: { eng: 'English' },
            flags: { png: 'us-flag.png', svg: 'us-flag.svg' },
            cca3: 'USA',
            borders: ['CAN', 'MEX'],
            area: 9833520,
            tld: ['.us'],
            currencies: { USD: { name: 'United States Dollar', symbol: '$' } },
            independent: true,
            unMember: true,
            latlng: [38, -97],
            timezones: ['UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00'],
            continents: ['North America'],
            cca2: 'US',
            fifa: 'USA',
          }
        ]),
      })
    );
    
    // Mock the neighboring countries fetch response (for borders)
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            name: { common: 'Canada' },
            cca3: 'CAN',
          },
          {
            name: { common: 'Mexico' },
            cca3: 'MEX',
          }
        ]),
      })
    );
    
    // Click the View Details button
    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    
    // Wait for the country details to appear
    await waitFor(() => {
      expect(screen.getByText('United States of America')).toBeInTheDocument();
    });
    
    // Check for detailed information
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Border Countries:')).toBeInTheDocument();
  });

  it('filters countries by search term', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search for a country...');
    fireEvent.change(searchInput, { target: { value: 'United' } });
    
    // Press Enter to trigger the search
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Verify the fetch is called correctly
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('https://restcountries.com/v3.1/name/United'));
    });
  });
});