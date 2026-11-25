const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');

const config = require('./config');
const validarEquipo = require('./middleware/validarEquipo');
const encabezadoRespuesta = require('./middleware/encabezadoRespuesta');
const enviosRouter = require('./routes/envios');

const app = express();

// No revelar la tecnología del servidor (quita "X-Powered-By: Express")
app.disable('x-powered-by');

// ------------------------------------------------------------
// 1) CORS: solo se permite explícitamente el origen del cliente web.
//    - Si la petición trae "Origin: http://localhost:5500", el servidor responde
//      "Access-Control-Allow-Origin: http://localhost:5500".
//    - Si trae cualquier otro Origin, NO se envía ese header y el navegador
//      bloquea la lectura de la respuesta.
//    Va ANTES de validarEquipo porque el preflight (OPTIONS) que hace el
//    navegador no incluye headers personalizados.
// ------------------------------------------------------------
app.use(
  cors({
    origin: [config.ORIGEN_PERMITIDO],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', config.HEADER_EQUIPO_NOMBRE],
    exposedHeaders: [config.HEADER_RESPUESTA_NOMBRE],
    maxAge: 600,
  })
);

// 2) Header X-Servidor-Procesado en todas las respuestas exitosas (2xx)
app.use(encabezadoRespuesta);

// 3) Log sencillo de cada petición (útil en la sustentación)
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(
      `${new Date().toISOString()}  ${req.method} ${req.originalUrl}  ->  ${res.statusCode}` +
        `  (${Date.now() - inicio} ms)  Origin=${req.get('Origin') || '-'}  ${config.HEADER_EQUIPO_NOMBRE}=${req.get(config.HEADER_EQUIPO_NOMBRE) || '-'}`
    );
  });
  next();
});

// 4) Validación obligatoria del header X-Red-Equipo para TODOS los endpoints
app.use(validarEquipo);

// 5) Lectura de cuerpos JSON
app.use(express.json({ limit: '100kb' }));

// 6) Endpoints
app.get('/', (req, res) => {
  res.json({
    servicio: 'API de consulta y registro de envíos',
    equipo: config.HEADER_RESPUESTA_VALOR,
    endpoints: ['GET /api/envios', 'GET /api/envios/:guia', 'POST /api/envios'],
  });
});
app.use('/api/envios', enviosRouter);

// 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', codigo: 404, mensaje: `Ruta ${req.method} ${req.originalUrl} no existe.` });
});

// Manejo de errores (p. ej. JSON mal formado en el cuerpo)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Bad Request', codigo: 400, mensaje: 'El cuerpo JSON está mal formado.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', codigo: 500 });
});

// ------------------------------------------------------------
// Arranque: HTTP siempre; HTTPS solo si existen certs/key.pem y certs/cert.pem
// ------------------------------------------------------------
http.createServer(app).listen(config.PUERTO, () => {
  console.log(`HTTP  -> http://localhost:${config.PUERTO}`);
  console.log(`Header requerido:  ${config.HEADER_EQUIPO_NOMBRE}: ${config.HEADER_EQUIPO_VALOR}`);
  console.log(`Header de respuesta: ${config.HEADER_RESPUESTA_NOMBRE}: ${config.HEADER_RESPUESTA_VALOR}`);
  console.log(`Origen CORS permitido: ${config.ORIGEN_PERMITIDO}`);
});

const keyPath = path.join(__dirname, '..', 'certs', 'key.pem');
const certPath = path.join(__dirname, '..', 'certs', 'cert.pem');
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  https
    .createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app)
    .listen(config.PUERTO_HTTPS, () => console.log(`HTTPS -> https://localhost:${config.PUERTO_HTTPS}`));
}
