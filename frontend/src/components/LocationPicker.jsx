// src/components/LocationPicker.jsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, X, Search, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LAHORE_BOUNDS = {
  north: 31.6500,  // North Lahore
  south: 31.3500,  // South Lahore  
  east: 74.4500,   // East Lahore
  west: 74.2500     // West Lahore
};

const LAHORE_CENTER = { lat: 31.5204, lng: 74.3587 };

const customIcon = new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #4f46e5; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); position: relative;">
           <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid white;"></div>
           <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 6px solid #4f46e5;"></div>
           <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [24, 32],
  iconAnchor: [12, 32]
});

// Check if location is within Lahore
const isWithinLahore = (lat, lng) => {
  return lat >= LAHORE_BOUNDS.south && 
         lat <= LAHORE_BOUNDS.north && 
         lng >= LAHORE_BOUNDS.west && 
         lng <= LAHORE_BOUNDS.east;
};

const LocationPicker = ({ onLocationSelect, title, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mapCenter, setMapCenter] = useState(LAHORE_CENTER);
  const searchRef = useRef(null);

  // Reverse geocoding (coordinates to address)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&countrycodes=pk`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat}, ${lng}`;
    }
  };

  // Search locations (restricted to Lahore area)
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Add Lahore to search query to restrict results
      const searchQueryWithCity = `${query}, Lahore, Pakistan`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQueryWithCity)}&limit=5&countrycodes=pk&bounded=1&viewbox=74.25,31.65,74.45,31.35`
      );
      const data = await response.json();
      
      // Filter results to only show Lahore locations
      const lahoreResults = data.filter(item => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        return isWithinLahore(lat, lng);
      });
      
      setSearchResults(lahoreResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle search result click
  const handleSearchResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (isWithinLahore(lat, lng)) {
      const location = {
        lat: lat,
        lng: lng,
        name: result.display_name
      };
      setSelectedLocation(location);
      setMapCenter({ lat, lng });
      onLocationSelect(location);
      setSearchQuery(result.display_name);
      setShowResults(false);
    } else {
      alert("Please select a location within Lahore city limits.");
    }
  };

  // Handle map click
  const handleMapClick = async (lat, lng) => {
    if (!isWithinLahore(lat, lng)) {
      alert("Please select a location within Lahore city limits.\n\nLahore bounds:\nNorth: 31.65\nSouth: 31.35\nEast: 74.45\nWest: 74.25");
      return;
    }
    
    const address = await reverseGeocode(lat, lng);
    const location = { lat, lng, name: address };
    setSelectedLocation(location);
    setSearchQuery(address.split(',')[0]);
    onLocationSelect(location);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    onLocationSelect(null);
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <div className="space-y-3" ref={searchRef}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-indigo-500" />
          {title}
        </h3>
        {selectedLocation && (
          <button 
            onClick={clearLocation}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search location in Lahore (e.g., Gulberg, DHA, Mall Road)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          {isSearching && (
            <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSearchResultClick(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
              >
                <p className="font-medium text-gray-800">{result.display_name.split(',')[0]}</p>
                <p className="text-xs text-gray-400 truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
        
        {showResults && searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500">No locations found in Lahore</p>
            <p className="text-xs text-gray-400 mt-1">Try: Gulberg, DHA, Model Town, Johar Town</p>
          </div>
        )}
      </div>

      {/* Leaflet Map - Restricted to Lahore */}
      <MapContainer
        key={`map-${mapCenter.lat}-${mapCenter.lng}`}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={13}
        style={{ height: '380px', width: '100%', borderRadius: '12px' }}
        className="z-0"
        maxBounds={[
          [LAHORE_BOUNDS.south, LAHORE_BOUNDS.west],
          [LAHORE_BOUNDS.north, LAHORE_BOUNDS.east]
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler />
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            draggable={true}
            icon={customIcon}
            eventHandlers={{
              dragend: async (e) => {
                const lat = e.target.getLatLng().lat;
                const lng = e.target.getLatLng().lng;
                if (isWithinLahore(lat, lng)) {
                  const address = await reverseGeocode(lat, lng);
                  const location = { lat, lng, name: address };
                  setSelectedLocation(location);
                  setSearchQuery(address.split(',')[0]);
                  onLocationSelect(location);
                } else {
                  alert("Marker must be within Lahore city limits!");
                  // Reset to previous location
                  if (selectedLocation) {
                    e.target.setLatLng([selectedLocation.lat, selectedLocation.lng]);
                  }
                }
              }
            }}
          />
        )}
      </MapContainer>

      {/* Lahore Info */}
      <div className="bg-gray-50 p-2 rounded-lg text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Navigation className="h-3 w-3" />
          Currently showing Lahore area only
        </p>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="bg-indigo-50 p-3 rounded-lg text-sm border border-indigo-200">
          <p className="font-medium text-indigo-800 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Selected Location:
          </p>
          <p className="text-gray-700 text-xs mt-1 line-clamp-2">{selectedLocation.name}</p>
          <p className="text-gray-500 text-xs mt-1">
            📍 {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;