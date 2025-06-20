// Integration test for the Home component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import '@testing-library/jest-dom';
import Home from '../src/components/Home'; // Adjust the import path to match your project structure

// Mock the fetch API
global.fetch = jest.fn();

// Mock country data for testing
const mockCountries = [
  {
    name: {
      common: 'Germany',
      official: 'Federal Republic of Germany'
    },
    flags: {
      png: 'https://example.com/germany.png',
      svg: 'https://example.com/germany.svg'
    },
    population: 83240525,
    region: 'Europe',
    subregion: 'Western Europe',
    capital: ['Berlin'],
    languages: { deu: 'German' },
    borders: ['AUT', 'BEL', 'CZE', 'DNK', 'FRA', 'LUX', 'NLD', 'POL', 'CHE'],
    cca3: 'DEU',
    cca2: 'DE',
    area: 357114,
    latlng: [51, 9],
    timezones: ['UTC+01:00'],
    continents: ['Europe'],
    independent: true,
    unMember: true,
    fifa: 'GER',
    tld: ['.de']
  },
  {
    name: {
      common: 'France',
      official: 'French Republic'
    },
    flags: {
      png: 'https://example.com/france.png',
      svg: 'https://example.com/france.svg'
    },
    population: 67391582,
    region: 'Europe',
    subregion: 'Western Europe',
    capital: ['Paris'],
    languages: { fra: 'French' },
    borders: ['AND', 'BEL', 'DEU', 'ITA', 'LUX', 'MCO', 'ESP', 'CHE'],
    cca3: 'FRA',
    cca2: 'FR',
    area: 551695,
    latlng: [46, 2],
    timezones: ['UTC-10:00', 'UTC-09:30', 'UTC-09:00', 'UTC-08:00', 'UTC-04:00', 'UTC-03:00', 'UTC+01:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+11:00', 'UTC+12:00'],
    continents: ['Europe'],
    independent: true,
    unMember: true,
    fifa: 'FRA',
    tld: ['.fr']
  },
  {
    name: {
      common: 'Canada',
      official: 'Canada'
    },
    flags: {
      png: 'https://example.com/canada.png',
      svg: 'https://example.com/canada.svg'
    },
    population: 38005238,
    region: 'Americas',
    subregion: 'North America',
    capital: ['Ottawa'],
    languages: { eng: 'English', fra: 'French' },
    borders: ['USA'],
    cca3: 'CAN',
    cca2: 'CA',
    area: 9984670,
    latlng: [60, -95],
    timezones: ['UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:30'],
    continents: ['North America'],
    independent: true,
    unMember: true,
    fifa: 'CAN',
    tld: ['.ca']
  }
];

// Mock country detail data
const mockCountryDetail = [
  {
    name: {
      common: 'Germany',
      official: 'Federal Republic of Germany'
    },
    flags: {
      png: 'https://example.com/germany.png',
      svg: 'https://example.com/germany.svg'
    },
    population: 83240525,
    region: 'Europe',
    subregion: 'Western Europe',
    capital: ['Berlin'],
    languages: { deu: 'German' },
    borders: ['AUT', 'BEL', 'CZE', 'DNK', 'FRA', 'LUX', 'NLD', 'POL', 'CHE'],
    cca3: 'DEU',
    cca2: 'DE',
    area: 357114,
    latlng: [51, 9],
    timezones: ['UTC+01:00'],
    continents: ['Europe'],
    independent: true,
    unMember: true,
    fifa: 'GER',
    tld: ['.de'],
    currencies: { EUR: { name: 'Euro', symbol: '€' } }
  }
];

// Mock neighbor countries data
const mockNeighbors = [
  {
    name: {
      common: 'Austria',
      official: 'Republic of Austria'
    },
    cca3: 'AUT'
  },
  {
    name: {
      common: 'France',
      official: 'French Republic'
    },
    cca3: 'FRA'
  }
];

// Setup mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Home Component - Integration Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  it('renders the loading state and then displays countries', async () => {
    // Mock successful fetch for all countries
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Check loading state
    expect(screen.getByText('Loading countries...')).toBeInTheDocument();

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.queryByText('Loading countries...')).not.toBeInTheDocument();
    });

    // Check if countries are displayed
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('filters countries by search term', async () => {
    // Mock successful fetch for all countries
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries
    });

    // Mock search results
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockCountries[0]] // Only Germany
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.queryByText('Loading countries...')).not.toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search for a country...');
    fireEvent.change(searchInput, { target: { value: 'Germany' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Wait for search results
    await waitFor(() => {
      // Should show Germany but not France or Canada
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.queryByText('France')).not.toBeInTheDocument();
      expect(screen.queryByText('Canada')).not.toBeInTheDocument();
    });
  });

it('filters countries by region', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockCountries
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [mockCountries[0], mockCountries[1]] // Germany and France
  });

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.queryByText('Loading countries...')).not.toBeInTheDocument();
  });

  const regionDropdown = screen.getByText('Filter by Region');
  fireEvent.click(regionDropdown);

  const europeOptions = screen.getAllByText('Europe');
  const dropdownOption = europeOptions.find(el => el.tagName.toLowerCase() === 'li');
  fireEvent.click(dropdownOption);

  await waitFor(() => {
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
  });
});


  it('shows country details when a country is selected', async () => {
    // Mock successful fetch for all countries
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries
    });

    // Mock country detail fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountryDetail
    });

    // Mock neighbors fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNeighbors
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.queryByText('Loading countries...')).not.toBeInTheDocument();
    });

    // Click on view details button for Germany
    const viewDetailsButtons = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsButtons[0]); // Clicking on first country (Germany)

    // Wait for country details to load
    await waitFor(() => {
      expect(screen.getByText('Federal Republic of Germany')).toBeInTheDocument();
    });

    // Check if detailed information is displayed
    expect(screen.getByText('Population:')).toBeInTheDocument();
    expect(screen.getByText('Languages:')).toBeInTheDocument();
    expect(screen.getByText('Border Countries:')).toBeInTheDocument();
    
    // Check for specific neighbor country
    expect(screen.getByText('Austria')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    
    // Check for the back button
    const backButton = screen.getByText('Back to All Countries');
    expect(backButton).toBeInTheDocument();
    
    // Click back button to return to country list
    fireEvent.click(backButton);
    
    // Check that we're back to the country list
    await waitFor(() => {
      expect(screen.getByText('Explore Our World')).toBeInTheDocument();
    });
  });

  it('navigates to login page when login button is clicked', async () => {
    // Mock successful fetch for all countries
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.queryByText('Loading countries...')).not.toBeInTheDocument();
    });

    // Click on login button
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // Check if navigate was called with correct route
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});