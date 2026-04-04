class Usuario {
  constructor({ nombre, email, password, estado, telefono, cedula, rol }) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.estado = estado ?? true; // Activo por defecto
    this.telefono = telefono;
    this.cedula = cedula;
    this.rol = rol || 'usuario'; // Rol por defecto
    this.fechaRegistro = new Date();
  }
}

module.exports = Usuario;