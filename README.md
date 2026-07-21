<div align="center">

# 📚 BookSpace

**Tu espacio para explorar, aprender y disfrutar la lectura.**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

</div>

---

## 📖 Descripción

**BookSpace** es una biblioteca digital web donde los usuarios pueden explorar un catálogo de libros, guardarlos en su lista personal, leer PDFs directamente en el navegador, dejar reseñas con calificaciones y llevar un seguimiento de su progreso de lectura mediante marcadores de página.

La aplicación fue diseñada con una estética **glassmorphism** moderna, soporte para **modo oscuro y claro**, y es completamente responsiva para dispositivos móviles (incluyendo pantallas tan pequeñas como un iPhone 6s). También cuenta con soporte **PWA** (Progressive Web App) para instalarse como aplicación nativa en dispositivos móviles y de escritorio.

Un aspecto destacado de la arquitectura es su sistema de **fallback inteligente**: si la base de datos MySQL no está disponible, el servidor automáticamente usa archivos JSON locales (`users.json`, `books.json`) para mantener la aplicación funcional.

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| 🔐 **Autenticación** | Registro e inicio de sesión con contraseñas hasheadas (bcrypt). Sesión persistida en `localStorage`. |
| 🏠 **Página de Inicio** | Catálogo completo de libros con buscador en tiempo real por título y autor. |
| ❤️ **Mi Lista** | Guarda libros en tu lista personal. Visualiza tu progreso de lectura (%) para cada uno. |
| 📄 **Lector de PDF** | Lector integrado que carga PDFs desde Google Drive directamente en el navegador. |
| 🔖 **Marcadores** | Guarda la página exacta donde te quedaste en cada libro, de forma persistente. |
| ⭐ **Reseñas y Calificaciones** | Sistema de puntuación de 1 a 5 estrellas con comentario opcional por libro. |
| 👤 **Perfil de Usuario** | Edita tu nombre, apellido, usuario, email y contraseña. Visualiza tu historial de reseñas. |
| 🌙 **Modo Oscuro / Claro** | Toggle de tema con paleta de colores cálida y elegante. Preferencia persistida en `localStorage`. |
| 📱 **PWA** | Instalable como app en móviles y escritorios. Service Worker para funcionamiento offline básico. |
| 🔄 **Fallback JSON** | Si MySQL no está disponible, la app funciona en "modo local" usando archivos JSON. |

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **[Node.js](https://nodejs.org/)** — Entorno de ejecución JavaScript en el servidor
- **[Express 5](https://expressjs.com/)** — Framework web minimalista para Node.js
- **[mysql2](https://github.com/sidorares/node-mysql2)** — Cliente MySQL con soporte para `Promise` y pool de conexiones
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — Hashing seguro de contraseñas
- **[express-validator](https://express-validator.github.io/)** — Validación y sanitización de inputs en las rutas de API
- **[dotenv](https://github.com/motdotla/dotenv)** — Gestión de variables de entorno

### Frontend
- **HTML5** — Estructura semántica de las páginas
- **CSS3 (Vanilla)** — Estilos personalizados con variables CSS, glassmorphism, animaciones y diseño responsive
- **JavaScript (Vanilla ES6+)** — Lógica del cliente: fetch a la API, manejo del DOM, localStorage, etc.
- **[Iconify](https://iconify.design/)** — Librería de íconos vectoriales (MDI, Game Icons)
- **[Google Fonts](https://fonts.google.com/)** — Tipografías Inter, Outfit y EB Garamond

### Base de Datos
- **MySQL 8** — Base de datos relacional principal (con fallback a JSON)

### Otros
- **PWA** — `manifest.json` + Service Worker (`sw.js`) para instalación nativa y caché offline

---

## 🏗️ Arquitectura y Estructura del Proyecto

El proyecto sigue una arquitectura **MVC (Modelo-Vista-Controlador)** en el backend, con el frontend servido como archivos estáticos.

```
BookSpace-2-main/
│
├── server.js                   # Punto de entrada: configura Express y monta las rutas
├── package.json                # Dependencias y scripts npm
├── database_seed.sql           # Script SQL para crear las tablas e insertar datos iniciales
├── books.json                  # Catálogo de libros (fallback sin base de datos)
├── users.json                  # Usuarios de prueba (fallback sin base de datos)
├── hash-passwords.js           # Script utilitario para hashear contraseñas en users.json
├── .env                        # Variables de entorno (NO incluido en el repositorio)
│
├── src/                        # Código fuente del backend
│   ├── config/
│   │   └── db.js               # Configuración del pool MySQL y lógica de fallback
│   ├── controllers/
│   │   ├── auth.controller.js  # Registro, login y actualización de perfil
│   │   ├── book.controller.js  # Obtener todos los libros / libro por ID
│   │   ├── favorites.controller.js # Agregar, eliminar y actualizar progreso de libros
│   │   ├── reviews.controller.js   # Guardar y obtener reseñas del usuario
│   │   └── view.controller.js  # Renderizado de páginas HTML (rutas de vista)
│   └── routes/
│       ├── auth.routes.js      # POST /api/auth/register, /login | PUT /api/auth/update-profile/:id
│       ├── book.routes.js      # GET /api/libros, /api/libros/:id
│       ├── favorites.routes.js # GET/POST/DELETE /api/favoritos | PUT /api/favoritos/progress
│       ├── reviews.routes.js   # POST /api/resenas | GET /api/resenas/:userId
│       └── view.routes.js      # Rutas que sirven los archivos HTML
│
└── public/                     # Archivos estáticos servidos al cliente
    ├── html/
    │   ├── index.html          # Login
    │   ├── register.html       # Registro
    │   ├── home.html           # Página principal con catálogo
    │   ├── reader.html         # Lector de PDF
    │   ├── mylist.html         # Mi lista de libros
    │   ├── perfil.html         # Perfil del usuario
    │   ├── modal.html          # Modal de detalle del libro (cargado dinámicamente)
    │   └── rating-modal.html   # Modal de calificación (cargado dinámicamente)
    ├── css/
    │   ├── main.css            # Sistema de diseño global, variables y modo claro/oscuro
    │   ├── dashboard.css       # Estilos de la página de inicio
    │   ├── reader.css          # Estilos del lector de PDF
    │   ├── modal.css           # Estilos del modal de libro
    │   ├── mylist.css          # Estilos de Mi Lista
    │   ├── perfil.css          # Estilos del perfil
    │   ├── rating-modal.css    # Estilos del modal de calificación
    │   ├── login.css           # Estilos de la página de login
    │   └── register.css        # Estilos de la página de registro
    ├── js/
    │   ├── dashboard.js        # Lógica del catálogo, búsqueda, favoritos y modal
    │   ├── reader.js           # Lógica del lector: PDF, zoom, marcadores y calificación
    │   ├── perfil.js           # Lógica del perfil y reseñas
    │   ├── login.js            # Lógica del formulario de login
    │   ├── register.js         # Lógica del formulario de registro
    │   ├── theme.js            # Toggle de modo oscuro/claro (se ejecuta antes del render)
    │   └── pwa.js              # Registro del Service Worker
    ├── images/                 # Imágenes de portadas y fondos
    ├── manifest.json           # Manifiesto PWA
    └── sw.js                   # Service Worker
```

---

## 🗃️ Esquema de Base de Datos

```sql
-- Usuarios del sistema
usuarios (id, nombre, apellido, nombre_usuario, email, contrasena, rol, creado_el)

-- Catálogo de libros
libros (id, titulo, autor, paginas, url_pdf, creado_el)

-- Relación usuario ↔ libro (lista personal + marcador de página)
libros_usuario (id_usuario, id_libro, agregado_el, pagina_marcador)

-- Reseñas y calificaciones
resenas (id, id_usuario, id_libro, contenido, calificacion, creado_el)
```

Los PDFs se almacenan en **Google Drive** y se referencian por su ID de archivo. El backend los convierte automáticamente a URLs de preview (`https://drive.google.com/file/d/{ID}/preview`).

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [MySQL](https://www.mysql.com/) 8.x (opcional — la app funciona sin él)
- npm (incluido con Node.js)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/BookSpace-2-main.git
cd BookSpace-2-main
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# Configuración de base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=book_app
DB_PORT=3306
```

> **Nota:** Si no configuras `.env` o MySQL no está disponible, la aplicación arrancará en **modo local** usando `users.json` y `books.json`. En ese modo el login funciona pero el registro y la actualización de perfil no están disponibles.

### 4. Configurar la base de datos (opcional)

Si usas MySQL, importa el schema y los datos de prueba:

```bash
mysql -u root -p < database_seed.sql
```

Esto creará las tablas `usuarios`, `libros`, `libros_usuario` y `resenas`, y cargará 15 libros y 2 usuarios de prueba.

### 5. Ejecutar la aplicación

**Modo desarrollo** (con auto-reload al guardar cambios):
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en: **[http://localhost:3000](http://localhost:3000)**

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `PUT` | `/api/auth/update-profile/:id` | Actualizar datos del perfil |

### Libros (`/api/libros`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/libros` | Obtener todos los libros |
| `GET` | `/api/libros/:id` | Obtener libro por ID (incluye URL de PDF procesada) |

### Lista Personal / Favoritos (`/api/favoritos`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/favoritos/:userId` | Obtener libros guardados del usuario |
| `POST` | `/api/favoritos` | Agregar libro a la lista |
| `DELETE` | `/api/favoritos` | Eliminar libro de la lista |
| `PUT` | `/api/favoritos/progress` | Actualizar marcador de página |

### Reseñas (`/api/resenas`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/resenas` | Crear o actualizar una reseña |
| `GET` | `/api/resenas/:userId` | Obtener reseñas de un usuario |

---

## 🌐 Páginas de la Aplicación

| Ruta | Página |
|------|--------|
| `/` o `/login` | Inicio de sesión |
| `/register` | Registro de nuevo usuario |
| `/inicio` | Catálogo principal de libros |
| `/reader?book=:id` | Lector de PDF del libro |
| `/mi-lista` | Lista personal de libros guardados |
| `/perfil` | Perfil y reseñas del usuario |
| `/logout` | Cierre de sesión |

---

## 🎨 Sistema de Diseño

BookSpace usa un sistema de diseño basado en **CSS Custom Properties (variables)** con dos paletas:

**Modo Oscuro** (default)
- Fondo: `#0f0b09` (negro cálido)
- Primario: `#c2a170` (dorado tostado)
- Tarjetas: glassmorphism con `rgba` y `backdrop-filter: blur`

**Modo Claro**
- Fondo: `#fbf9f5` (crema suave)
- Primario: `#7a5c2e` (marrón dorado)
- Tarjetas: blanco translúcido con sombras suaves

El tema se aplica añadiendo la clase `light-mode` al elemento `<html>` y se persiste automáticamente en `localStorage`.

---

## 📱 Soporte Móvil

La aplicación es totalmente responsiva con breakpoints en `768px`, `480px` y `390px`. Se han aplicado ajustes específicos para pantallas pequeñas como el **iPhone 6s (375px)** en:


<div align="center">

 **BookSpace** © 2026

</div>
