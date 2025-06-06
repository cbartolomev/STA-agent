# 🏢 ST Analytics - Selector de Inmuebles Inteligente

Una aplicación web moderna e interactiva para la selección y análisis de propiedades inmobiliarias con búsqueda geográfica avanzada.

## 🌟 Características Principales

- 🗺️ **Mapa Interactivo**: OpenStreetMap con navegación fluida
- 🏠 **18+ Propiedades**: Inmuebles realistas distribuidos en Madrid Centro
- 🎯 **Selección Inteligente**: Clic en mapa o marcadores para seleccionar
- 📐 **Radio de 100m**: Búsqueda automática de propiedades similares
- 📊 **Análisis de Similitud**: Algoritmo basado en precio, tipo y superficie
- 📱 **Diseño Responsive**: Funciona en móviles y desktop
- 💰 **100% Gratuito**: Sin APIs de pago ni restricciones

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm

### Instalación y Ejecución
```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev
# Abrir http://localhost:5173

# Build para producción
npm run build

# Previsualizar build
npm run preview
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18.3 + TypeScript + Vite
- **Mapas**: Leaflet + react-leaflet (OpenStreetMap)
- **Estilos**: TailwindCSS + Componentes personalizados
- **Iconos**: Lucide React
- **Build**: Vite con optimizaciones de producción

## 📦 Estructura del Proyecto

```
src/
├── components/
│   └── PropertySelector.tsx    # Componente principal
├── App.tsx                     # Aplicación raíz
├── App.css                     # Estilos personalizados
└── main.tsx                   # Punto de entrada

public/
├── data/
│   └── properties.json        # Base de datos de propiedades
└── _redirects                 # Configuración Netlify
```

## 🌍 Despliegue

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instrucciones detalladas de despliegue en:

- ✅ **Vercel** (Recomendado)
- ✅ **Netlify** 
- ✅ **GitHub Pages**
- ✅ **Railway**

## 📊 Datos de Demostración

- **18 propiedades** con coordenadas GPS reales de Madrid
- **Tipos**: Casas, Oficinas, Apartamentos
- **Precio promedio**: €544,167
- **Superficie promedio**: 139 m²
- **Características completas**: precio, superficie, habitaciones, baños, año

## 🎨 Características de Diseño

- **Branding**: Logo ST Analytics profesional
- **Colores**: Gradientes azul-índigo-púrpura corporativos
- **Layout**: Grid responsive (mapa 2/3, panel 1/3)
- **UX**: Popups informativos, efectos hover, estados de carga

## 🔍 Funcionalidades Avanzadas

- **Cálculo Geográfico**: Distancia Haversine para precisión
- **Algoritmo de Similitud**: Ordenamiento inteligente multi-criterio
- **Estados Dinámicos**: Loading, selección, manejo de errores
- **Performance**: Memoización y optimización de renders

## 📝 Licencia

Proyecto desarrollado para demostración de capacidades de desarrollo web moderno.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue antes de enviar cambios importantes.

---

**🌟 ¡Tu aplicación ST Analytics está lista para conquistar el mundo inmobiliario!** 🌟
