class Reporte {
  constructor({ asignado, descripcion, ubicacion, urgencia, provincia, evidencias, usuarioId }) {

    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.urgencia = urgencia || 'media';
    this.provincia = provincia;
    this.asignado = asignado || 'FaunaLink';
    this.evidencias = evidencias || [];

    this.estado = 'Pendiente';
    this.fecha = new Date();
    this.usuarioId = usuarioId;
  }
}

module.exports = Reporte;