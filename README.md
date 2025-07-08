
# lakautac-api-sample

Este proyecto es una **demo** que muestra cómo:

1. **Autenticarse** con Keycloak (infraestructura de Lakaut) directamente desde el navegador.  
2. **Listar solicitudes disponibles** mediante un endpoint autenticado.  
3. **Subir un documento PDF**, configurar las opciones de firma y enviarlo a la API de Lakaut para su firma digital.  
4. **Descargar el PDF firmado**.

---

## ✅ Requisitos

- Node.js v14+  
- Cuenta de usuario válida en el realm `firmanube` de Keycloak  

## 📁 Estructura del Proyecto

```
lakautac-api-sample/
├─ package.json        // Solo incluye Express y nodemon
├─ server.js           // Servidor Node.js que sirve archivos estáticos
├─ public/
│   ├─ index.html      // Front-end con autenticación Keycloak y firma de PDF
│   └─ assets/         // (Opcional) recursos adicionales
└─ README.md
```

---

## 🚀 Instalación y uso

1. **Clonar este repositorio**
```bash
git clone https://github.com/Lakaut-FD/lakautac-api-sample/
cd lakautac-api-sample
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar el servidor**
```bash
npm start
```
> El servidor se iniciará en el puerto **3000** o el siguiente disponible.

4. **Abrir en el navegador**
[http://localhost:3000](http://localhost:3000)

---

## 🔐 Autenticación con Keycloak

Esta demo utiliza **Keycloak JS como módulo ES** directamente desde CDN. No se utiliza `keycloak.json`.

Fragmento en `index.html`:

```js
import Keycloak from 'https://cdn.jsdelivr.net/npm/keycloak-js@26.2.0/+esm';

const keycloak = new Keycloak({
  url: 'https://www.lakautac.com.ar/auth',
  realm: 'firmanube',
  clientId: 'LakautNubeAPI'
});
```

- El usuario es redirigido al login de Keycloak.
- Una vez autenticado, se obtiene el **token JWT** necesario para realizar llamadas a la API.
- El token se renueva automáticamente cada 60 segundos.

---

## 📄 Flujo de Firma Digital

1. **Seleccionar un archivo PDF**  
2. **Elegir una solicitud disponible** (se obtiene con `GET /solicitudes`)  
3. **Configurar las opciones de firma** (fuente, tamaño, posición, página, etc.)  
4. **Enviar a `POST /solicitudes/firmar`** junto con el token y la clave  
5. **Descargar automáticamente el documento firmado**

---

## ✍️ Opciones de Firma

Estas son las opciones utilizadas por defecto (pueden editarse desde el formulario):

```json
{
  "solicitudId": 123,
  "fontColor": "BLACK",
  "fontName": "Serif",
  "fontSize": 12,
  "fontStyle": "PLAIN",
  "page": 1,
  "zoomPercent": 100,
  "x": 100,
  "y": 100,
  "certificateOptions": {},
  "restriccion": "NO_VALUE",
  "password": "tu_clave"
}
```

> Por seguridad, la contraseña **no se muestra** en la vista previa de opciones (`<textarea>`), pero sí se envía en el `FormData`.

---

## 🖥️ `server.js` (resumen)

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

- Sirve los archivos desde la carpeta `public/`
- Busca un puerto disponible a partir del 3000

---

## 🛠️ package.json (actualizado)

```json
{
  "name": "lakautac-api-sample",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.21.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

---

## 🤝 Contribuciones

Si encontrás errores o querés mejorar la demo, podés hacer un fork y enviar un Pull Request. También podés abrir un Issue o contactar al equipo de soporte de Lakaut.
