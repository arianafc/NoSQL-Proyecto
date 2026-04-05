function verificarSesion() {

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    Swal.fire('Error', 'No ha iniciado sesión', 'error')
    .then(() => {
      window.location.href = '/login';
    });
    return false;
  }

  return true;
}

verificarSesion();

function mostrarOpcionesAdmin() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.rol === 'Administrador') {
        $("#adminOpciones").removeClass("d-none");
    }
}

mostrarOpcionesAdmin();