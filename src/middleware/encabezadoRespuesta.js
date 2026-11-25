const { HEADER_RESPUESTA_NOMBRE, HEADER_RESPUESTA_VALOR } = require('../config');

/**
 * Agrega X-Servidor-Procesado: Equipo-N SOLO a las respuestas exitosas (2xx).
 *
 * Se intercepta res.writeHead, que Node llama justo antes de enviar la línea de
 * estado y los headers al socket TCP. En ese momento ya se conoce el código de
 * estado final, así que el header se añade únicamente si es 2xx.
 */
function encabezadoRespuesta(req, res, next) {
  const writeHeadOriginal = res.writeHead;

  res.writeHead = function (statusCode, ...resto) {
    if (statusCode >= 200 && statusCode < 300) {
      res.setHeader(HEADER_RESPUESTA_NOMBRE, HEADER_RESPUESTA_VALOR);
    }
    return writeHeadOriginal.call(this, statusCode, ...resto);
  };

  next();
}

module.exports = encabezadoRespuesta;
