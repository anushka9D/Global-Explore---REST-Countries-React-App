import { useState, useEffect, useRef } from 'react';
import { 
  FaSearch, FaFilter, FaGlobe, FaChevronDown, FaSpinner, 
  FaUser, FaLock, FaInfoCircle, FaArrowLeft, FaStar, FaRegStar, FaUserCircle
} from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { animateHeading } from './headingAnimation';

function SimpleTypewriter({ sentences, pauseDuration = 2000 }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [delta, setDelta] = useState(100); // Faster typing speed

  useEffect(() => {
    const ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text, delta, isDeleting, index]);

  const tick = () => {
    const i = index % sentences.length;
    const fullText = sentences[i];
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    // Set speed during typing/deleting
    if (isDeleting) {
      setDelta(50); // Faster deletion
    } else {
      setDelta(100); // Faster typing
    }

    // Pause at the end of a sentence
    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(pauseDuration);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setIndex(prevIndex => prevIndex + 1);
      setDelta(100); // Restart typing quickly
    }
  };

  return (
    <div className="min-h-[60px]">
      <p className="text-lg md:text-xl text-blue-100 max-w-2xl flex flex-wrap">
        {text && (
          <span className="animate-fadeIn">{text}</span>
        )}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
  
}

function HomeUser() {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDetails, setCountryDetails] = useState(null);
  const [countryNeighbors, setCountryNeighbors] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const navigate = useNavigate();

  const headingRef = useRef(null);
    
    // Add this useEffect to trigger the animation when component mounts
    useEffect(() => {
      const cleanup = animateHeading(headingRef);
      return cleanup; // This will handle the cleanup when component unmounts
    }, []);

  const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== 'user') {
        navigate('/login'); 
      }
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login');
    }
  }, []);

  // Fetch all countries on initial load
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        
        const data = await response.json();
        setCountries(data);
        setFilteredCountries(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchAllCountries();
    
  // Load favorites from API
  const fetchFavorites = async () => {
    try {
      const response = await axios.get('http://localhost:8090/api/auth/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.favorites) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // If unauthorized, redirect to login
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };
  
  fetchFavorites();
}, [token]);

  // Filter countries based on search term and region
  useEffect(() => {
    const filterCountries = () => {
      let result = countries;
      
      if (showFavorites) {
        result = countries.filter(country => 
          favorites.includes(country.cca3)
        );
      } else {
        // Filter by search term
        if (searchTerm) {
          result = result.filter(country => 
            country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Filter by region
        if (selectedRegion) {
          result = result.filter(country => 
            country.region === selectedRegion
          );
        }
      }
      
      setFilteredCountries(result);
    };
    
    filterCountries();
  }, [searchTerm, selectedRegion, countries, favorites, showFavorites]);



  // Fetch country details when a country is selected
  useEffect(() => {
    const fetchCountryDetails = async () => {
      if (!selectedCountry) return;
      
      try {
        setIsDetailLoading(true);
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${selectedCountry}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch country details');
        }
        
        const data = await response.json();
        setCountryDetails(data[0]);
        
        // Fetch neighbor countries if the country has borders
        if (data[0].borders && data[0].borders.length > 0) {
          const bordersString = data[0].borders.join(',');
          const neighborsResponse = await fetch(`https://restcountries.com/v3.1/alpha?codes=${bordersString}`);
          
          if (!neighborsResponse.ok) {
            throw new Error('Failed to fetch neighboring countries');
          }
          
          const neighborsData = await neighborsResponse.json();
          setCountryNeighbors(neighborsData);
        } else {
          setCountryNeighbors([]);
        }
        
        setIsDetailLoading(false);
      } catch (error) {
        console.error('Error fetching country details:', error);
        setError(error.message);
        setIsDetailLoading(false);
      }
    };

    fetchCountryDetails();
  }, [selectedCountry]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowFavorites(false);
  };


  const handleRegionSearch = async (region) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://restcountries.com/v3.1/region/${region}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch countries from ${region}`);
      }
      
      const data = await response.json();
      setCountries(data);
      setFilteredCountries(data);
      setSelectedRegion(region);
      setIsLoading(false);
    } catch (error) {
      console.error(`Error fetching countries from ${region}:`, error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleNameSearch = async () => {
    if (!searchTerm) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`https://restcountries.com/v3.1/name/${searchTerm}`);
      
      if (!response.ok) {
        throw new Error(`No countries found matching "${searchTerm}"`);
      }
      
      const data = await response.json();
      setFilteredCountries(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching for country:', error);
      setError(`No countries found matching "${searchTerm}"`);
      setFilteredCountries([]);
      setIsLoading(false);
    }
  };

  const toggleRegionDropdown = () => {
    setIsRegionOpen(!isRegionOpen);
  };

  const clearFilters = async () => {
    setSearchTerm('');
    setSelectedRegion('');
    setShowFavorites(false);
    
    // Fetch all countries again
    try {
      setIsLoading(true);
      const response = await fetch('https://restcountries.com/v3.1/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      
      const data = await response.json();
      setCountries(data);
      setFilteredCountries(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleLogOut = () => {
    Cookies.remove('token');
    navigate('/login');
  };

  const handleShowMore = () => {
    setShowAllCountries(true);
  };

  const viewCountryDetails = async (countryCode) => {
    setSelectedCountry(countryCode);
    window.scrollTo(0, 0);
  };

  const backToList = () => {
    setSelectedCountry(null);
    setCountryDetails(null);
    setCountryNeighbors([]);
  };

  const toggleFavorite = async (countryCode) => {
    try {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      if (favorites.includes(countryCode)) {
        // Remove from favorites
        await axios.delete('http://localhost:8090/api/auth/remove/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: { countryId: countryCode }
        });
        
        setFavorites(favorites.filter(code => code !== countryCode));
      } else {
        // Add to favorites
        await axios.put('http://localhost:8090/api/auth/add/favorites', 
          { countryId: countryCode },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setFavorites([...favorites, countryCode]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update favorites',
        confirmButtonColor: '#3085d6'
      });
      
      // If unauthorized, redirect to login
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };

  const toggleFavoritesView = () => {
    setShowFavorites(!showFavorites);
    setSearchTerm('');
    setSelectedRegion('');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with Login Button */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={clearFilters}>
            <FaGlobe className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Global Explorely</span>
          </div>
          
          {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Profile Button */}
          <button 
            className="relative overflow-hidden group flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 hover:from-green-500 hover:to-teal-600 text-white font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
            onClick={handleProfileClick}
          >
            <div className="flex items-center space-x-2 relative z-10">
              <div className="bg-opacity-20 p-1 rounded-full">
                <FaUserCircle className={`w-4 h-4 transition-transform duration-300 ${isProfileHovered ? 'transform -translate-y-4 opacity-0' : ''}`} />
                <FaUser className={`w-4 h-4 absolute top-1 left-1 transition-transform duration-300 ${isProfileHovered ? '' : 'transform translate-y-4 opacity-0'}`} />
              </div>
              <span>Profile</span>
            </div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0"></div>
          </button>
          
          {/* Logout Button */}
          <button 
            className="relative overflow-hidden group flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
            onClick={handleLogOut}
          >
            <div className="flex items-center space-x-2 relative z-10">
              <div className="bg-opacity-20 p-1 rounded-full">
                <FaUser className={`w-4 h-4 transition-transform duration-300 ${isLoginHovered ? 'transform -translate-y-4 opacity-0' : ''}`} />
                <FaLock className={`w-4 h-4 absolute top-1 left-1 transition-transform duration-300 ${isLoginHovered ? '' : 'transform translate-y-4 opacity-0'}`} />
              </div>
              <span>LogOut</span>
            </div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0"></div>
          </button>
        </div>
        </div>
      </header>

      {selectedCountry && countryDetails ? (
        // Country Detail View
        <div className="container mx-auto px-4 py-8">
          <button 
            className="flex items-center mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            onClick={backToList}
          >
            <FaArrowLeft className="mr-2" /> Back to All Countries
          </button>

          {isDetailLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading country details...</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{countryDetails.name.common}</h1>
                      <button 
                        className="p-2 text-yellow-500 hover:text-yellow-600"
                        onClick={() => toggleFavorite(countryDetails.cca3)}
                      >
                        {favorites.includes(countryDetails.cca3) ? (
                          <FaStar className="w-6 h-6" />
                        ) : (
                          <FaRegStar className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                      {countryDetails.name.official}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Population:</span> {countryDetails.population.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Region:</span> {countryDetails.region}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Sub Region:</span> {countryDetails.subregion || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Capital:</span> {countryDetails.capital?.[0] || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Top Level Domain:</span> {countryDetails.tld?.[0] || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Currencies:</span> {
                            countryDetails.currencies ? 
                            Object.values(countryDetails.currencies).map(currency => currency.name).join(', ') :
                            'N/A'
                          }
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Languages:</span> {
                            countryDetails.languages ? 
                            Object.values(countryDetails.languages).join(', ') :
                            'N/A'
                          }
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Area:</span> {countryDetails.area.toLocaleString()} km²
                        </p>
                      </div>
                    </div>
                    
                    {countryDetails.borders && countryDetails.borders.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Border Countries:</h3>
                        <div className="flex flex-wrap gap-2">
                          {countryNeighbors.map(neighbor => (
                            <button 
                              key={neighbor.cca3}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => viewCountryDetails(neighbor.cca3)}
                            >
                              {neighbor.name.common}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img 
                      src={countryDetails.flags?.png || countryDetails.flags?.svg} 
                      alt={`Flag of ${countryDetails.name.common}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Additional Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">General</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Independent:</span> {countryDetails.independent ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">UN Member:</span> {countryDetails.unMember ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Status:</span> {countryDetails.status || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Geography</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Latitude/Longitude:</span> {countryDetails.latlng?.join(', ') || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Timezone(s):</span> {countryDetails.timezones?.join(', ') || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Continent:</span> {countryDetails.continents?.join(', ') || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Codes</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">ISO 3166-1 alpha-2:</span> {countryDetails.cca2 || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">ISO 3166-1 alpha-3:</span> {countryDetails.cca3 || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">FIFA code:</span> {countryDetails.fifa || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        // Countries List View
        <>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-indigo-900 dark:to-purple-900">
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="flex flex-col items-center justify-center text-center">
                <FaGlobe className="text-white w-16 h-16 md:w-20 md:h-20 mb-6 animate-pulse" />
                <h1 ref={headingRef} className="text-4xl md:text-6xl font-bold text-white mb-4">Explore Our World</h1>
                <SimpleTypewriter 
                  sentences={[
                    "Discover fascinating cultures and traditions from every corner of the globe",
                    "Explore essential facts about 250+ countries with just a few clicks",
                    "Learn about population, languages, and borders of nations worldwide",
                    "Compare countries across continents and understand global connections",
                    "Embark on a digital journey through our planet's diverse countries"
                  ]} 
                />
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="relative w-full md:w-1/2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-white"
                  placeholder="Search for a country..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSearch()}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <button 
                    className="flex items-center justify-between w-full sm:w-48 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    onClick={toggleRegionDropdown}
                  >
                    <div className="flex items-center">
                      <FaFilter className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedRegion || 'Filter by Region'}
                      </span>
                    </div>
                    <FaChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isRegionOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {isRegionOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                      <ul>
                        {regions.map((region) => (
                          <li 
                            key={region} 
                            className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
                            onClick={() => {
                              handleRegionSearch(region);
                              setIsRegionOpen(false); // Close the dropdown immediately
                            }}
                          >
                            {region}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <button 
                  className={`px-4 py-3 ${showFavorites ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'} text-gray-800 dark:text-white font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center`}
                  onClick={toggleFavoritesView}
                >
                  <FaStar className="w-4 h-4 mr-2" />
                  {showFavorites ? 'All Countries' : 'Favorites'}
                </button>
                
                {(searchTerm || selectedRegion || showFavorites) && (
                  <button 
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Countries Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading countries...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-red-600 mb-4">{error}</p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">No countries found matching your criteria</p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCountries.slice(0, showAllCountries ? filteredCountries.length : 12).map((country) => (
                  <div 
                    key={country.cca3} 
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={country.flags?.png || country.flags?.svg} 
                        alt={`Flag of ${country.name.common}`}
                        className="w-full h-full object-cover"
                      />
                      <button 
                        className="absolute top-2 right-2 p-2 bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 rounded-full shadow-md hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(country.cca3);
                        }}
                      >
                        {favorites.includes(country.cca3) ? (
                          <FaStar className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <FaRegStar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        )}
                      </button>
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 truncate">{country.name.common}</h2>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Population:</span> {country.population.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Region:</span> {country.region}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Languages:</span> {
                            country.languages ? 
                            Object.values(country.languages).join(', ') :
                            'N/A'
                          }
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Capital:</span> {country.capital?.[0] || 'N/A'}
                        </p>
                      </div>
                      <button 
                        className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                        onClick={() => viewCountryDetails(country.cca3)}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show More Button */}
            {filteredCountries.length > 12 && !isLoading && !showAllCountries && (
              <div className="flex justify-center mt-8">
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 duration-300"
                  onClick={handleShowMore}>
                  Load More Countries
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default HomeUser;