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