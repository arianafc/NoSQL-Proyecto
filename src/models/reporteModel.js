class Reporte {
  constructor({ descripcion, ubicacion, urgencia, provincia, evidencias, usuarioId }) {

    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.urgencia = urgencia || 'media';
    this.provincia = provincia;

    this.evidencias = evidencias || [];

    this.estado = 'pendiente';
    this.fecha = new Date();
    this.usuarioId = usuarioId;
  }
}

module.exports = Reporte;