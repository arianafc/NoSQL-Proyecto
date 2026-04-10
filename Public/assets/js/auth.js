function verificarSesion() {

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    Swal.fire('Error', 'No ha iniciado sesión', 'error')
    .then(() => {
      window.location.href = '/';
    });
    return false;
  }

  return true;
}

verificarSesion();

function mostrarOpcionesAdmin() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.rol === 'admin') {
        $(".adminOpciones").removeClass("d-none");
         $(".usuarioOpciones").addClass("d-none");
    } else if (usuario && usuario.rol === 'usuario') {
       $(".usuarioOpciones").removeClass("d-none");
        $(".adminOpciones").addClass("d-none");
    }
}

mostrarOpcionesAdmin();