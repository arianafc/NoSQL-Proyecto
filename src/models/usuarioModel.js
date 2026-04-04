class Usuario {
  constructor({ nombre, email, password, estado, telefono, cedula }) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.estado = estado ?? true; // Activo por defecto
    this.telefono = telefono;
    this.cedula = cedula;
    this.fechaRegistro = new Date();
  }
}

module.exports = Usuario;