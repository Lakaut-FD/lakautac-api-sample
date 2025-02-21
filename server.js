// server.js

const express = require('express');
const path = require('path');

// Creamos la app de Express
const app = express();

// Servimos la carpeta "public" con el index.html, keycloak.json, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Función para iniciar el servidor en un puerto libre
function startServerOnFreePort(port) {
  const server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });

  // Manejo de error: si el puerto está en uso, intentamos uno más alto
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`El puerto ${port} está en uso. Intentando en el puerto ${port + 1}...`);
      startServerOnFreePort(port + 1);
    } else {
      console.error('Error en el servidor:', err);
    }
  });
}

// Tomamos PORT de la variable de entorno si existe, si no usamos 3000
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// Arrancamos el server
startServerOnFreePort(DEFAULT_PORT);
