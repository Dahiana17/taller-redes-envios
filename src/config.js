// ============================================================
//  CONFIGURACIÓN DEL EQUIPO
// ============================================================
//  N = número de lista (listado oficial) del primer integrante
//      del equipo cuando se ordenan alfabéticamente por apellido.
//
//  Grupo 1 (miércoles), orden alfabético por apellido:
//    15 - Marin Giraldo Dahiana      <- primer integrante => N = 15
//    16 - Moncada Castro Angel Stewar
//  (Se puede sobrescribir con la variable de entorno N_EQUIPO)
// ============================================================
const N = Number(process.env.N_EQUIPO ?? 15);

module.exports = {
  N,
  // Valor exacto que debe traer el header X-Red-Equipo en cada petición
  HEADER_EQUIPO_NOMBRE: 'X-Red-Equipo',
  HEADER_EQUIPO_VALOR: `CIAF-${N}`,

  // Header que el servidor devuelve en todas las respuestas exitosas
  HEADER_RESPUESTA_NOMBRE: 'X-Servidor-Procesado',
  HEADER_RESPUESTA_VALOR: `Equipo-${N}`,

  // Origen explícitamente permitido por CORS (cliente web del equipo)
  ORIGEN_PERMITIDO: process.env.ORIGEN_PERMITIDO || 'http://localhost:5500',

  PUERTO: Number(process.env.PORT || 3000),
  PUERTO_HTTPS: Number(process.env.PORT_HTTPS || 3443),
};
