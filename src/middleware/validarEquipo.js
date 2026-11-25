const { HEADER_EQUIPO_NOMBRE, HEADER_EQUIPO_VALOR } = require('../config');

/**
 * Middleware de control de acceso por encabezado HTTP.
 *
 * Toda petición debe traer:  X-Red-Equipo: CIAF-N
 * Si falta o el valor no coincide EXACTAMENTE, se responde 401 Unauthorized.
 *
 * Nota: Express/Node entregan los nombres de los headers en minúsculas
 * (HTTP define los nombres de encabezado como case-insensitive), por eso se
 * lee con req.get(), que no distingue mayúsculas. El VALOR sí se compara exacto.
 */
function validarEquipo(req, res, next) {
  const valorRecibido = req.get(HEADER_EQUIPO_NOMBRE);

  if (valorRecibido === undefined) {
    return res.status(401).json({
      error: 'Unauthorized',
      codigo: 401,
      mensaje: `Falta el encabezado obligatorio ${HEADER_EQUIPO_NOMBRE}.`,
      como_solucionarlo: `Agregue el header "${HEADER_EQUIPO_NOMBRE}: ${'CIAF-<N>'}" con el valor asignado a su equipo.`,
    });
  }

  if (valorRecibido !== HEADER_EQUIPO_VALOR) {
    return res.status(401).json({
      error: 'Unauthorized',
      codigo: 401,
      mensaje: `El valor del encabezado ${HEADER_EQUIPO_NOMBRE} es incorrecto.`,
      valor_recibido: valorRecibido,
      como_solucionarlo: 'El valor debe coincidir exactamente (mayúsculas, guion y número) con el asignado al equipo.',
    });
  }

  next();
}

module.exports = validarEquipo;
