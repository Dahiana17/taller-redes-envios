const express = require('express');
const router = express.Router();

// "Base de datos" en memoria (se reinicia cada vez que se levanta el servidor)
const ESTADOS_VALIDOS = ['REGISTRADO', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO'];

const envios = [
  {
    guia: 'ENV-1001',
    remitente: 'Ferretería El Tornillo',
    destinatario: 'Laura Gómez',
    ciudadOrigen: 'Pereira',
    ciudadDestino: 'Manizales',
    pesoKg: 2.5,
    estado: 'EN_TRANSITO',
    fechaRegistro: '2026-11-20T09:15:00.000Z',
  },
  {
    guia: 'ENV-1002',
    remitente: 'Tienda Tech Dosquebradas',
    destinatario: 'Carlos Ruiz',
    ciudadOrigen: 'Dosquebradas',
    ciudadDestino: 'Armenia',
    pesoKg: 1.2,
    estado: 'ENTREGADO',
    fechaRegistro: '2026-11-18T14:40:00.000Z',
  },
  {
    guia: 'ENV-1003',
    remitente: 'Librería Central',
    destinatario: 'Ana María Torres',
    ciudadOrigen: 'Pereira',
    ciudadDestino: 'Cali',
    pesoKg: 4.0,
    estado: 'REGISTRADO',
    fechaRegistro: '2026-11-23T16:05:00.000Z',
  },
];

let consecutivo = 1004;

// GET /api/envios            -> lista todos los envíos
// GET /api/envios?estado=X   -> filtra por estado
router.get('/', (req, res) => {
  const { estado } = req.query;
  let resultado = envios;

  if (estado) {
    const estadoNormalizado = String(estado).toUpperCase();
    if (!ESTADOS_VALIDOS.includes(estadoNormalizado)) {
      return res.status(400).json({
        error: 'Bad Request',
        codigo: 400,
        mensaje: `Estado "${estado}" no válido.`,
        estados_validos: ESTADOS_VALIDOS,
      });
    }
    resultado = envios.filter((e) => e.estado === estadoNormalizado);
  }

  res.status(200).json({ total: resultado.length, envios: resultado });
});

// GET /api/envios/:guia -> consulta el estado de un envío puntual
router.get('/:guia', (req, res) => {
  const envio = envios.find((e) => e.guia === req.params.guia.toUpperCase());
  if (!envio) {
    return res.status(404).json({
      error: 'Not Found',
      codigo: 404,
      mensaje: `No existe un envío con la guía ${req.params.guia}.`,
    });
  }
  res.status(200).json(envio);
});

// POST /api/envios -> registra un nuevo envío (cuerpo JSON)
router.post('/', (req, res) => {
  if (!req.is('application/json')) {
    return res.status(400).json({
      error: 'Bad Request',
      codigo: 400,
      mensaje: 'El cuerpo debe enviarse como JSON (header Content-Type: application/json).',
    });
  }

  const { remitente, destinatario, ciudadOrigen, ciudadDestino, pesoKg } = req.body ?? {};
  const faltantes = ['remitente', 'destinatario', 'ciudadOrigen', 'ciudadDestino', 'pesoKg'].filter(
    (campo) => req.body?.[campo] === undefined || req.body?.[campo] === ''
  );

  if (faltantes.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      codigo: 400,
      mensaje: 'Faltan campos obligatorios en el cuerpo JSON.',
      campos_faltantes: faltantes,
    });
  }

  if (typeof pesoKg !== 'number' || pesoKg <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      codigo: 400,
      mensaje: 'El campo pesoKg debe ser un número mayor que 0.',
    });
  }

  const nuevo = {
    guia: `ENV-${consecutivo++}`,
    remitente,
    destinatario,
    ciudadOrigen,
    ciudadDestino,
    pesoKg,
    estado: 'REGISTRADO',
    fechaRegistro: new Date().toISOString(),
  };
  envios.push(nuevo);

  res.status(201).location(`/api/envios/${nuevo.guia}`).json({
    mensaje: 'Envío registrado correctamente.',
    envio: nuevo,
  });
});

module.exports = router;
