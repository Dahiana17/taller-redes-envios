// Servidor estático mínimo (sin dependencias) para el cliente web en el puerto 5500.
// Uso:  npm run cliente            -> http://localhost:5500  (origen PERMITIDO por CORS)
//       PUERTO_CLIENTE=5600 npm run cliente  -> http://localhost:5600 (origen NO permitido)
const http = require('http');
const fs = require('fs');
const path = require('path');

const puerto = Number(process.env.PUERTO_CLIENTE || 5500);
const archivo = path.join(__dirname, 'index.html');

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(archivo).pipe(res);
  })
  .listen(puerto, () => console.log(`Cliente web -> http://localhost:${puerto}`));
