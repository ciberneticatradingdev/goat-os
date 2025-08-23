# Components Documentation

Esta carpeta contiene todos los componentes de la aplicación TrollOS, un sistema operativo simulado con estética Windows XP.

## Componentes Principales

### ApplicationWindows.astro
Contiene todas las ventanas de aplicaciones del sistema operativo simulado, incluyendo:
- Notepad
- My Computer
- Internet Explorer
- DexScreener
- Twitter/X
- Telegram
- Contract Information
- Chat
- Recycle Bin
- Troll Era Teaser
- Video Viewer
- PDF Viewer

### Desktop.astro
Componente principal del escritorio que incluye:
- Fondo del escritorio con imagen de trollface
- GIF animado de troll que se mueve por la pantalla
- Contenedor para iconos del escritorio
- Barra de tareas
- Menú de inicio

### DesktopIcons.astro
Iconos del escritorio que permiten abrir diferentes aplicaciones:
- My Computer
- Notepad
- Internet Explorer
- Recycle Bin
- DexScreener
- Twitter
- Telegram
- Contract Info
- Chat
- Troll Era Teaser

### IntroScreen.astro
Pantalla de introducción con:
- Logo de TrollOS
- Información de copyright de Troll Era Corporation
- Botón para continuar al escritorio

### StartMenu.astro
Menú de inicio con estilo Windows XP que incluye:
- Logo y nombre de TrollOS
- Lista de aplicaciones disponibles
- Funcionalidad de mostrar/ocultar

### Taskbar.astro
Barra de tareas inferior que incluye:
- Botón de inicio
- Reloj en tiempo real
- Estilo Windows XP clásico

## SoundModal Component

Componente reutilizable para mostrar un modal de autorización de audio con efectos de sonido. Se utiliza para solicitar permiso al usuario antes de reproducir audio automáticamente.

### Características
- Modal completamente autocontenido con HTML, CSS y JavaScript
- Reproducción automática de audio desde un tiempo específico
- Diseño responsive con estilo Windows XP
- Fácil integración en cualquier proyecto Astro
- API global para control programático
- Eventos personalizados para manejo de respuestas

### Uso

```astro
---
import SoundModal from '../components/SoundModal.astro';
---

<SoundModal 
  audioSrc="/troll.mp3" 
  audioStartTime={7} 
/>
```

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `audioSrc` | string | No | `/troll.mp3` | Ruta del archivo de audio a reproducir |
| `audioStartTime` | number | No | `7` | Tiempo en segundos desde donde empezar la reproducción |
| `onComplete` | function | No | - | Callback ejecutado cuando el usuario hace una selección |

### Eventos

El componente emite un evento personalizado `soundModalComplete` cuando el usuario hace una selección:

```javascript
document.addEventListener('soundModalComplete', (event) => {
  const { choice } = event.detail; // 'yes' o 'no'
  console.log('Usuario eligió:', choice);
});
```

### API Global

El componente expone métodos globales para control programático:

```javascript
// Mostrar el modal
window.soundModal.show();

// Ocultar el modal
window.soundModal.hide();
```

### Instalación en otro proyecto

1. Copia el archivo `SoundModal.astro` a tu carpeta `src/components/`
2. Asegúrate de tener las imágenes necesarias en tu carpeta `public/`:
   - `/trollface.png`
3. Importa y usa el componente en cualquier página Astro

```astro
---
import SoundModal from '../components/SoundModal.astro';
---

<Layout>
  <SoundModal />
  <!-- Tu contenido aquí -->
</Layout>
```

## Estructura del Proyecto

```
src/components/
├── ApplicationWindows.astro  # Todas las ventanas de aplicaciones
├── Desktop.astro            # Escritorio principal
├── DesktopIcons.astro       # Iconos del escritorio
├── IntroScreen.astro        # Pantalla de bienvenida
├── SoundModal.astro         # Modal de autorización de audio
├── StartMenu.astro          # Menú de inicio
├── Taskbar.astro           # Barra de tareas
└── README.md               # Esta documentación
```

## Notas Técnicas

- Todos los componentes están diseñados con estética Windows XP
- Se utiliza Tailwind CSS para el styling
- Los componentes son completamente funcionales y autocontenidos
- La aplicación simula un sistema operativo completo en el navegador
- Se incluyen efectos de sonido y animaciones para mejorar la experiencia

## Dependencias

- Astro.js como framework principal
- Tailwind CSS para estilos
- Archivos de audio en formato MP3
- Imágenes PNG para iconos y fondos

## Contribución

Para agregar nuevos componentes o modificar existentes:
1. Mantén la consistencia con el estilo Windows XP
2. Asegúrate de que los componentes sean responsivos
3. Documenta cualquier nueva funcionalidad en este README
4. Prueba la compatibilidad con diferentes navegadores