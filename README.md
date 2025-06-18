# lakautac-api-sample

Este proyecto es una **demo** para ilustrar cómo:

1. **Autenticarse** con Keycloak JS (apuntando a la infraestructura de Lakaut).  
2. **Listar solicitudes** disponibles y obtener sus IDs.  
3. **Subir** un PDF, **configurar** las opciones de firma (posición, fuente, etc.) y **firmar** el documento llamando a la API de Lakaut.

## Estructura del proyecto

```
lakautac-api-sample/
├─ package.json        // Dependencias y scripts (start con nodemon)
├─ server.js           // Servidor Node.js con Express
├─ public/
│   ├─ index.html      // Front-end con Keycloak, Axios y Tailwind/Flowbite
│   └─ keycloak.json   // Config de Keycloak (usando la infraestructura de Lakaut)
└─ README.md
```

### package.json (ejemplo mínimo)

```json
{
  "name": "lakautac-api-sample",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "nodemon server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "express": "^4.21.2",
    "keycloak-js": "^19.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

## Instalación y uso

1. **Clona** este repositorio:
   ```bash
   git clone https://github.com/Lakaut-FD/lakautac-api-sample/
   ```
2. Ingresa a la carpeta:
   ```bash
   cd lakautac-api-sample
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```
   - Se usará **nodemon** para recarga automática.  
   - El servidor se levantará en el **puerto 3000** (u otro si 3000 está ocupado).  

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador:
   - Serás redirigido al **login de Keycloak** (infraestructura de Lakaut).  
   - Tras iniciar sesión, la aplicación cargará las solicitudes disponibles y te permitirá firmar documentos.

## Configuración de Keycloak (keycloak.json)

El archivo `public/keycloak.json` incluye la configuración para apuntar al Keycloak de Lakaut:
```json
{
  "realm": "firmanube",
  "auth-server-url": "https://www.lakautac.com.ar/auth",
  "ssl-required": "none",
  "resource": "LakautNubeAPI",
  "public-client": true,
  "confidential-port": 0
}
```
No necesitas levantar tu propio Keycloak, esta demo ya usa la **infraestructura** de Lakaut. Asegúrate de tener **credenciales** válidas y permisos para firmar.

## Flujo de la demo

1. **GET /solicitudes**: al autenticarse, se obtienen las solicitudes/certificados asociados al usuario.  
2. **Subir PDF**: se elige un PDF en el formulario.  
3. **Opciones de firma**: se configuran en un acordeón de Flowbite (fuente, posición x/y, página, etc.).  
4. **POST /solicitudes/firmar**: se envía `multipart/form-data` con el PDF y un JSON de opciones.  
5. **Respuesta**: la API devuelve el PDF firmado, que se descarga automáticamente.

## server.js (resumen)

```js
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

function startServerOnFreePort(port) {
  const server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`El puerto ${port} está en uso. Probando en ${port + 1}...`);
      startServerOnFreePort(port + 1);
    } else {
      console.error('Error en el servidor:', err);
    }
  });
}

startServerOnFreePort(3000);
```

- Inicia en **puerto 3000** o busca el siguiente si está ocupado.  
- Sirve la carpeta `public/`, donde se ubican `index.html` y `keycloak.json`.

## Documentación Detallada de la API

A continuación se describen paso a paso todos los procesos implementados en `public/index.html` para autenticación, obtención de solicitudes y firma de documentos digitales.

### 1. Requisitos previos

- Node.js (v14+ recomendado)
- Cuenta de usuario válida en el realm **firmanube** de Keycloak.
- Archivo `public/keycloak.json` con configuración de Keycloak (ver sección 4).

### 2. Instalación del proyecto

1. Clonar repositorio:
   ```bash
   git clone https://github.com/Lakaut-FD/lakautac-api-sample.git
   ```
2. Entrar al directorio del proyecto:
   ```bash
   cd lakautac-api-sample
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Iniciar servidor de desarrollo:
   ```bash
   npm start
   ```
   - El servidor se levantará en **http://localhost:3000** (o siguiente puerto disponible).

### 3. Flujo general de la aplicación

Al acceder a la aplicación, `index.html` ejecuta los siguientes pasos:

#### 3.1 Inicialización y autenticación con Keycloak

```js
const keycloak = new Keycloak('./keycloak.json');
keycloak.init({ onLoad: 'login-required', checkLoginIframe: false })
  .then(authenticated => { ... })
  .catch(err => { ... });
```

- Se redirige al usuario al **login de Keycloak** si no está autenticado.
- `keycloak.token` almacena el **token JWT** necesario para llamadas a la API.
- Se configura un **intervalo** para renovar el token cada 60 segundos.
- Botón **Cerrar Sesión** (`btnLogout`) invoca `keycloak.logout()`.

#### 3.2 Obtención de solicitudes disponibles

```js
axios.get('https://www.lakautac.com.ar/firma-api/solicitudes', {
  headers: { Authorization: `Bearer ${tokenActivo}` }
});
```

- Se realiza un **GET** a `/solicitudes` con el token en el header.
- La respuesta es un objeto `{ solicitudId: descripción }`.
- Se carga el elemento `<select id="solicitudesSelect">` con estas opciones.
- Botón **Refrescar** (`btnRefreshSolicitudes`) recarga esta lista.

#### 3.3 Configuración de opciones de firma

Las opciones se definen en el objeto `optionsObj`:

```js
let optionsObj = {
  solicitudId: 0,
  fontColor: 'BLACK',
  fontName: 'Serif',
  fontSize: 12,
  fontStyle: 'PLAIN',
  page: 1,
  zoomPercent: 100,
  x: 100,
  y: 100,
  certificateOptions: {},
  restriccion: 'NO_VALUE'
};
```

- Un acordeón (Flowbite) permite ajustar cada parámetro.
- Al pulsar **Previsualizar / Actualizar Options**, se llama a `updateOptionsFromUI()`, que:
  - Lee valores de los inputs.
  - Actualiza `optionsObj` y muestra un **JSON** en `<textarea id="optionsPreview">`.

#### 3.4 Firma del documento

```js
firmaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Validar PDF y contraseña
  // Crear FormData con file y options
  const resp = await axios.post(
    'https://www.lakautac.com.ar/firma-api/solicitudes/firmar',
    formData,
    {
      headers: { Authorization: `Bearer ${tokenActivo}` },
      responseType: 'arraybuffer'
    }
  );
  // Descargar PDF firmado
});
```

1. Se valida que el usuario haya seleccionado un PDF y proporcionado la contraseña del certificado.
2. `updateOptionsFromUI()` actualiza `optionsObj` e inserta `optionsObj.password`.
3. Se construye `FormData` con el archivo y el JSON de opciones.
4. Se envía **POST** a `/solicitudes/firmar`.
5. El servidor devuelve el PDF firmado como **arraybuffer**, que se descarga automáticamente.

### 4. Configuración de Keycloak

Ubique `public/keycloak.json` y compruebe los siguientes parámetros:

```json
{
  "realm": "firmanube",
  "auth-server-url": "https://www.lakautac.com.ar/auth",
  "ssl-required": "none",
  "resource": "LakautNubeAPI",
  "public-client": true,
  "confidential-port": 0
}
```

- `realm`: nombre del espacio de autenticación en Keycloak.
- `auth-server-url`: URL del servidor Keycloak.
- `resource`: identificador del cliente en Keycloak.

### Adaptadores de Keycloak

Keycloak ofrece adaptadores para múltiples entornos y lenguajes de programación, entre ellos:

- Adaptador JavaScript (`keycloak-js`)
- Adaptador Node.js (`keycloak-connect`)
- Adaptador Angular (`keycloak-angular`)
- Adaptador React (`keycloak-react`)
- Adaptador Spring Boot (`keycloak-spring-boot-starter`)
- Adaptador Quarkus (`quarkus-keycloak`)
- Adaptador WildFly/EAP
- Adaptador .NET (`keycloak-dotnet-adapter`)

En esta demo se utiliza el adaptador JavaScript (`keycloak-js`), pero puedes escoger el adaptador que mejor se adapte a tu proyecto.

### 5. Estructura de archivos

```
lakautac-api-sample/
├─ package.json
├─ server.js
├─ public/
│   ├─ index.html
│   ├─ keycloak.json
│   └─ assets/ (CSS, JS, imágenes)
└─ README.md
```

### 6. Contribuciones y Soporte

Pulsa **Fork** y envía **Pull Requests** para mejorar ejemplos o corregir errores. Si tienes dudas, abre un **Issue** en GitHub o contacta al equipo de soporte de Lakaut.

---


