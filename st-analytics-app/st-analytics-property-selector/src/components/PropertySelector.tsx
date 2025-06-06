import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Building, Home, MapPin, Euro, Maximize, Bath, Calendar, Search, X, TrendingUp } from 'lucide-react';

interface Property {
  id: number;
  lat: number;
  lng: number;
  tipo: string;
  precio: number;
  superficie: number;
  habitaciones: number;
  baños: number;
  direccion: string;
  descripcion: string;
  año: number;
}

const PropertySelector: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 });
  const [showRadius, setShowRadius] = useState(false);
  const [loading, setLoading] = useState(true);

  const GOOGLE_MAPS_API_KEY = "AIzaSyBWXNE96Eb23e16DCw7Zfb9rkYwxRiTUfQ";

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  // Cargar propiedades al montar el componente
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch('/data/properties.json');
        const data = await response.json();
        setProperties(data.properties);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando propiedades:', error);
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Calcular distancia entre dos puntos geográficos
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Encontrar propiedades similares en un radio de 100m
  const findSimilarProperties = useCallback((targetProperty: Property) => {
    const similar = properties.filter(property => {
      if (property.id === targetProperty.id) return false;
      
      const distance = calculateDistance(
        targetProperty.lat, targetProperty.lng,
        property.lat, property.lng
      );
      
      return distance <= 100; // 100 metros
    });

    // Ordenar por similitud (precio, tipo, superficie)
    similar.sort((a, b) => {
      const priceDiffA = Math.abs(a.precio - targetProperty.precio);
      const priceDiffB = Math.abs(b.precio - targetProperty.precio);
      const typeSimilarityA = a.tipo === targetProperty.tipo ? 0 : 1;
      const typeSimilarityB = b.tipo === targetProperty.tipo ? 0 : 1;
      
      return (priceDiffA + typeSimilarityA * 50000) - (priceDiffB + typeSimilarityB * 50000);
    });

    return similar;
  }, [properties]);

  // Manejar clic en el mapa
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Crear una propiedad temporal en el punto clicado
      const tempProperty: Property = {
        id: 0,
        lat,
        lng,
        tipo: "Punto Seleccionado",
        precio: 0,
        superficie: 0,
        habitaciones: 0,
        baños: 0,
        direccion: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        descripcion: "Ubicación seleccionada en el mapa",
        año: new Date().getFullYear()
      };

      setSelectedProperty(tempProperty);
      setMapCenter({ lat, lng });
      setShowRadius(true);
      
      // Encontrar propiedades cercanas
      const nearby = properties.filter(property => {
        const distance = calculateDistance(lat, lng, property.lat, property.lng);
        return distance <= 100;
      });
      
      setSimilarProperties(nearby);
    }
  }, [properties, calculateDistance]);

  // Manejar selección de propiedad
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setMapCenter({ lat: property.lat, lng: property.lng });
    setShowRadius(true);
    setSimilarProperties(findSimilarProperties(property));
  };

  // Obtener icono según tipo de propiedad
  const getPropertyIcon = (tipo: string) => {
    switch (tipo) {
      case 'Casa':
        return <Home className="w-4 h-4" />;
      case 'Oficina':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ST Analytics</h1>
                <p className="text-sm text-gray-600">Selector de Inmuebles Inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              <span>Haz clic en el mapa para encontrar propiedades similares</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Mapa Interactivo - Madrid Centro
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {properties.length} propiedades disponibles
                </p>
              </div>
              
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={16}
                  onClick={handleMapClick}
                  options={{
                    styles: [
                      {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                      }
                    ]
                  }}
                >
                  {/* Marcadores de propiedades */}
                  {properties.map((property) => (
                    <Marker
                      key={property.id}
                      position={{ lat: property.lat, lng: property.lng }}
                      onClick={() => handlePropertySelect(property)}
                      icon={{
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="15" cy="15" r="12" fill="${property.tipo === 'Casa' ? '#10b981' : property.tipo === 'Oficina' ? '#3b82f6' : '#f59e0b'}" stroke="white" stroke-width="2"/>
                            <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${property.tipo === 'Casa' ? 'C' : property.tipo === 'Oficina' ? 'O' : 'A'}</text>
                          </svg>
                        `)}`,
                        scaledSize: window.google ? new window.google.maps.Size(30, 30) : undefined
                      }}
                    />
                  ))}

                  {/* Marcadores de propiedades similares */}
                  {similarProperties.map((property) => (
                    <Marker
                      key={`similar-${property.id}`}
                      position={{ lat: property.lat, lng: property.lng }}
                      icon={{
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                          <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12.5" cy="12.5" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
                            <text x="12.5" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">S</text>
                          </svg>
                        `)}`,
                        scaledSize: window.google ? new window.google.maps.Size(25, 25) : undefined
                      }}
                    />
                  ))}

                  {/* Círculo de radio de 100m */}
                  {showRadius && selectedProperty && (
                    <Circle
                      center={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                      radius={100}
                      options={{
                        fillColor: '#3b82f6',
                        fillOpacity: 0.1,
                        strokeColor: '#3b82f6',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                      }}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Propiedad seleccionada */}
            {selectedProperty && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">Propiedad Seleccionada</h3>
                    <button
                      onClick={() => {
                        setSelectedProperty(null);
                        setShowRadius(false);
                        setSimilarProperties([]);
                      }}
                      className="text-white hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    {getPropertyIcon(selectedProperty.tipo)}
                    <span className="font-medium text-gray-900">{selectedProperty.tipo}</span>
                  </div>
                  
                  {selectedProperty.precio > 0 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Euro className="w-4 h-4" />
                      <span className="font-bold text-lg">{formatPrice(selectedProperty.precio)}</span>
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm">{selectedProperty.direccion}</p>
                  <p className="text-gray-700">{selectedProperty.descripcion}</p>
                  
                  {selectedProperty.superficie > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-1 text-sm">
                        <Maximize className="w-4 h-4 text-gray-500" />
                        <span>{selectedProperty.superficie} m²</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Home className="w-4 h-4 text-gray-500" />
                        <span>{selectedProperty.habitaciones} hab.</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Bath className="w-4 h-4 text-gray-500" />
                        <span>{selectedProperty.baños} baños</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{selectedProperty.año}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Propiedades similares */}
            {similarProperties.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <h3 className="text-lg font-semibold">
                    Propiedades Similares (Radio 100m)
                  </h3>
                  <p className="text-red-100 text-sm">
                    {similarProperties.length} propiedades encontradas
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {similarProperties.map((property, index) => (
                    <div
                      key={property.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        index === similarProperties.length - 1 ? 'border-b-0' : ''
                      }`}
                      onClick={() => handlePropertySelect(property)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getPropertyIcon(property.tipo)}
                            <span className="font-medium text-sm">{property.tipo}</span>
                          </div>
                          
                          <div className="text-green-600 font-bold text-sm mb-1">
                            {formatPrice(property.precio)}
                          </div>
                          
                          <p className="text-gray-600 text-xs mb-2">{property.direccion}</p>
                          
                          <div className="flex space-x-3 text-xs text-gray-500">
                            <span>{property.superficie} m²</span>
                            <span>{property.habitaciones} hab.</span>
                            <span>{property.baños} baños</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <h3 className="text-lg font-semibold">Estadísticas del Mercado</h3>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Propiedades:</span>
                  <span className="font-bold">{properties.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precio Promedio:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(properties.reduce((sum, p) => sum + p.precio, 0) / properties.length)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Superficie Promedio:</span>
                  <span className="font-bold">
                    {Math.round(properties.reduce((sum, p) => sum + p.superficie, 0) / properties.length)} m²
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySelector;