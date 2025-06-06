# 🚀 Guía de Despliegue - ST Analytics

Esta aplicación está lista para desplegarse en múltiples servicios de hosting gratuitos. Aquí tienes opciones probadas y confiables:

## 📦 Preparación del Proyecto

El proyecto ya está completamente configurado y optimizado para despliegue en producción.

### Estructura del Proyecto:
```
st-analytics-leaflet/
├── src/                 # Código fuente React + TypeScript
├── public/             # Archivos estáticos (datos, imágenes)
├── dist/               # Build de producción (listo para desplegar)
├── package.json        # Dependencias y scripts
└── vite.config.ts     # Configuración de Vite
```

## 🌟 Opciones de Despliegue (Recomendadas)

### 1. 🔥 VERCEL (Más Recomendado)
**Ventajas:** Gratis, muy rápido, perfecto para React, CDN global

**Pasos:**
1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub/Google
3. Clic en "Add New Project"
4. Sube la carpeta `st-analytics-leaflet` completa
5. Vercel detectará automáticamente que es un proyecto Vite
6. Clic en "Deploy"
7. ¡Listo! Tendrás una URL como `https://tu-proyecto.vercel.app`

### 2. 🎯 NETLIFY
**Ventajas:** Gratis, fácil, buena para SPAs, formularios integrados

**Pasos:**
1. Ve a [netlify.com](https://netlify.com)
2. Regístrate gratis
3. Arrastra la carpeta `dist/` a la zona de "Deploy"
4. O usa "Sites" → "Add new site" → "Deploy manually"
5. ¡Listo! URL como `https://random-name.netlify.app`

### 3. 📊 GITHUB PAGES
**Ventajas:** Totalmente gratis, integrado con GitHub

**Pasos:**
1. Crea un repositorio en GitHub
2. Sube todos los archivos del proyecto
3. Ve a Settings → Pages
4. Selecciona "Deploy from a branch" → "main" → "/docs"
5. Copia `dist/` a `docs/` en el repositorio
6. URL: `https://tu-usuario.github.io/nombre-repo`

### 4. 🚄 RAILWAY
**Ventajas:** Moderno, fácil, buena performance

**Pasos:**
1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona el repositorio
5. Railway detectará Vite automáticamente

## 🛠️ Scripts Disponibles

```bash
# Desarrollo local
npm run dev          # Inicia servidor de desarrollo en http://localhost:5173

# Construcción para producción
npm run build        # Genera carpeta dist/ optimizada

# Vista previa local del build
npm run preview      # Previsualiza el build en http://localhost:4173

# Instalación de dependencias
npm install          # Instala todas las dependencias
```

## 📁 Archivos Listos para Despliegue

- **`dist/`**: Build de producción completo y optimizado
- **Tamaño:** ~400KB total (CSS: 86KB, JS: 316KB gzipped)
- **Tecnología:** React 18 + TypeScript + Vite + Leaflet
- **Compatible:** Todos los navegadores modernos

## 🔧 Configuraciones Incluidas

### Vite Configuración (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  base: './',  // Para despliegue en subdirectorios
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  }
})
```

### Variables de Entorno
No se requieren variables de entorno. La aplicación usa:
- ✅ OpenStreetMap (gratuito, sin API key)
- ✅ Leaflet (biblioteca JavaScript gratuita)
- ✅ Datos JSON estáticos incluidos

## 🌍 URLs de Ejemplo

Después del despliegue, tu aplicación estará disponible en URLs como:
- **Vercel:** `https://st-analytics-inmuebles.vercel.app`
- **Netlify:** `https://st-analytics-immobiles.netlify.app`
- **GitHub Pages:** `https://tu-usuario.github.io/st-analytics`
- **Railway:** `https://st-analytics-production.up.railway.app`

## ✅ Verificación Post-Despliegue

Una vez desplegado, verifica que:
1. ✅ El logo ST Analytics es visible
2. ✅ El mapa OpenStreetMap carga correctamente
3. ✅ Los 18 marcadores de propiedades aparecen
4. ✅ Al hacer clic se puede seleccionar inmuebles
5. ✅ Aparece el círculo de 100 metros
6. ✅ La búsqueda de similares funciona
7. ✅ El panel lateral muestra información

## 🆘 Solución de Problemas

### Error 404 al recargar página
**Solución:** Configura redirects para SPA
- **Netlify:** Crear `public/_redirects` con `/* /index.html 200`
- **Vercel:** Crear `vercel.json` con rewrite rules

### Problema de CORS
**Solución:** Los datos están incluidos localmente, no debería haber problemas

### Mapa no carga
**Solución:** Verificar que la conexión a internet permite OpenStreetMap

## 💡 Recomendación Final

**Para la mejor experiencia, usa VERCEL:**
1. Es el más rápido y confiable
2. CDN global automático
3. HTTPS automático
4. Perfecto para aplicaciones React
5. Despliegue en menos de 2 minutos

¡Tu aplicación ST Analytics estará disponible para el mundo! 🌟
