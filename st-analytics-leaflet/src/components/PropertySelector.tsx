import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Building, Home, MapPin, Euro, Maximize, Bath, Calendar, Search, X, TrendingUp } from 'lucide-react';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

interface ClickedLocation {
  lat: number;
  lng: number;
}

const PropertySelector: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [clickedLocation, setClickedLocation] = useState<ClickedLocation | null>(null);
  const [showRadius, setShowRadius] = useState(false);
  const [loading, setLoading] = useState(true);

  const madridCenter: [number, number] = [40.4168, -3.7038];

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

  // Calcular distancia entre dos puntos geográficos (fórmula de Haversine)
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
  const findSimilarProperties = useCallback((targetLat: number, targetLng: number, targetProperty?: Property) => {
    const similar = properties.filter(property => {
      if (targetProperty && property.id === targetProperty.id) return false;
      
      const distance = calculateDistance(targetLat, targetLng, property.lat, property.lng);
      return distance <= 100; // 100 metros
    });

    // Ordenar por similitud si hay propiedad objetivo, sino por distancia
    if (targetProperty) {
      similar.sort((a, b) => {
        const priceDiffA = Math.abs(a.precio - targetProperty.precio);
        const priceDiffB = Math.abs(b.precio - targetProperty.precio);
        const typeSimilarityA = a.tipo === targetProperty.tipo ? 0 : 1;
        const typeSimilarityB = b.tipo === targetProperty.tipo ? 0 : 1;
        
        return (priceDiffA + typeSimilarityA * 50000) - (priceDiffB + typeSimilarityB * 50000);
      });
    } else {
      similar.sort((a, b) => {
        const distA = calculateDistance(targetLat, targetLng, a.lat, a.lng);
        const distB = calculateDistance(targetLat, targetLng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return similar;
  }, [properties]);

  // Componente para manejar clics en el mapa
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setClickedLocation({ lat, lng });
        setSelectedProperty(null);
        setShowRadius(true);
        
        // Encontrar propiedades cercanas
        const nearby = findSimilarProperties(lat, lng);
        setSimilarProperties(nearby);
      },
    });
    return null;
  };

  // Manejar selección de propiedad
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setClickedLocation(null);
    setShowRadius(true);
    setSimilarProperties(findSimilarProperties(property.lat, property.lng, property));
  };

  // Crear iconos personalizados según tipo de propiedad
  const createCustomIcon = (tipo: string, isSelected: boolean = false) => {
    let color = '#3b82f6'; // Azul por defecto
    let letter = 'A';
    
    switch (tipo) {
      case 'Casa':
        color = '#10b981'; // Verde
        letter = 'C';
        break;
      case 'Oficina':
        color = '#3b82f6'; // Azul
        letter = 'O';
        break;
      case 'Apartamento':
        color = '#f59e0b'; // Amarillo
        letter = 'A';
        break;
    }

    if (isSelected) {
      color = '#ef4444'; // Rojo para seleccionado
    }

    const svgIcon = `
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${letter}</text>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Icono para ubicación clickeada
  const clickedLocationIcon = L.divIcon({
    html: `
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
      </svg>
    `,
    className: 'clicked-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

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

  const centerLocation = selectedProperty 
    ? [selectedProperty.lat, selectedProperty.lng] as [number, number]
    : clickedLocation 
    ? [clickedLocation.lat, clickedLocation.lng] as [number, number]
    : madridCenter;

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
                  Mapa Interactivo - Madrid Centro (OpenStreetMap)
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {properties.length} propiedades disponibles - Tecnología 100% gratuita
                </p>
              </div>
              
              <div className="h-[600px]">
                <MapContainer 
                  center={centerLocation} 
                  zoom={16} 
                  style={{ height: '100%', width: '100%' }}
                  key={`${centerLocation[0]}-${centerLocation[1]}`}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <MapClickHandler />

                  {/* Marcadores de propiedades */}
                  {properties.map((property) => (
                    <Marker
                      key={property.id}
                      position={[property.lat, property.lng]}
                      icon={createCustomIcon(property.tipo, selectedProperty?.id === property.id)}
                      eventHandlers={{
                        click: () => handlePropertySelect(property)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center space-x-2 mb-2">
                            {getPropertyIcon(property.tipo)}
                            <span className="font-medium">{property.tipo}</span>
                          </div>
                          <div className="text-green-600 font-bold mb-1">
                            {formatPrice(property.precio)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{property.direccion}</p>
                          <div className="text-xs text-gray-500">
                            {property.superficie}m² • {property.habitaciones} hab. • {property.baños} baños
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Marcador de ubicación clickeada */}
                  {clickedLocation && (
                    <Marker
                      position={[clickedLocation.lat, clickedLocation.lng]}
                      icon={clickedLocationIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <p className="font-medium text-sm">Ubicación Seleccionada</p>
                          <p className="text-xs text-gray-600">
                            Lat: {clickedLocation.lat.toFixed(4)}, Lng: {clickedLocation.lng.toFixed(4)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Círculo de radio de 100m */}
                  {showRadius && (selectedProperty || clickedLocation) && (
                    <Circle
                      center={centerLocation}
                      radius={100}
                      pathOptions={{
                        fillColor: '#3b82f6',
                        fillOpacity: 0.1,
                        color: '#3b82f6',
                        weight: 2,
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Propiedad seleccionada o ubicación clickeada */}
            {(selectedProperty || clickedLocation) && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">
                      {selectedProperty ? 'Propiedad Seleccionada' : 'Ubicación Seleccionada'}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedProperty(null);
                        setClickedLocation(null);
                        setShowRadius(false);
                        setSimilarProperties([]);
                      }}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {selectedProperty ? (
                    <>
                      <div className="flex items-center space-x-2">
                        {getPropertyIcon(selectedProperty.tipo)}
                        <span className="font-medium text-gray-900">{selectedProperty.tipo}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-green-600">
                        <Euro className="w-4 h-4" />
                        <span className="font-bold text-lg">{formatPrice(selectedProperty.precio)}</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{selectedProperty.direccion}</p>
                      <p className="text-gray-700">{selectedProperty.descripcion}</p>
                      
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
                    </>
                  ) : clickedLocation ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium text-gray-900">Punto Seleccionado</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm">
                        Lat: {clickedLocation.lat.toFixed(4)}, Lng: {clickedLocation.lng.toFixed(4)}
                      </p>
                      <p className="text-gray-700">Ubicación seleccionada en el mapa</p>
                    </>
                  ) : null}
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

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Tecnología 100% gratuita - Sin APIs de pago</span>
                  </div>
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