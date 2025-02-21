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


