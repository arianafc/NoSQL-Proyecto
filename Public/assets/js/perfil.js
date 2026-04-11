const APIUsuario = 'http://localhost:3000/api/usuarios/';


$(document).ready(function() {



 const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario.rol === 'admin' || usuario.rol === 'organizacion') {    
    $("#cardVoluntariado").addClass('d-none');
}

if (usuario.passwordTemporal) {
  const aviso = document.getElementById("avisoPasswordTemporal");

  aviso.classList.remove("d-none");

}

document.getElementById("formActualizarContrasenna").addEventListener("submit", function (e) {
  e.preventDefault();

  const nueva = document.getElementById("contrasennaActualizar").value.trim();
  const confirmar = document.getElementById("contrasennaConfirmarActualizar").value.trim();

  if (!nueva || !confirmar) {
  Swal.fire("Error", "Debes completar ambos campos", "warning");
  return;
}

if (nueva.length < 6) {
  Swal.fire(
    "Contraseña inválida",
    "La contraseña debe tener al menos 6 caracteres",
    "warning"
  );
  return;
}

if (nueva !== confirmar) {
  Swal.fire(
    "Error",
    "Las contraseñas no coinciden",
    "error"
  );
  return;
}
  fetch(APIUsuario+"actualizarPassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nuevoPassword: nueva,
      userId: usuario.id
    })
  })
    .then(res => res.json())
    .then(data => {
      Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        text: data.message
      }).then(() => {
        usuario.passwordTemporal === false;
        location.reload();
      });
    })
    .catch(() => {
      Swal.fire("Error", "No se pudo actualizar la contraseña", "error");
    });
});




$('#activarVoluntariado').change(function() {
  if ($(this).is(':checked')) {
    console.log('Voluntariado activado');
    $("#formActualizarVoluntario").removeClass('d-none');
  } else {
    console.log('Voluntariado desactivado');
    $("#formActualizarVoluntario").addClass('d-none');
}   
});



$("#nombreCompletoActualizar").val(usuario.nombre);
$("#emailActualizar").val(usuario.email);
$("#telefonoActualizar").val(usuario.telefono);
$("#cedulaActualizar").val(usuario.cedula);
$("#direccionActualizar").val(usuario.direccion || '');
$("#provinciaActualizar").val(usuario.provincia || '');
$("#paisActualizar").val(usuario.pais || '');


if (usuario.voluntario) {
  $("#activarVoluntariado").prop('checked', true);
  $("#formActualizarVoluntario").removeClass('d-none');
    usuario.habilidades.forEach(h => {
        $(`.habilidad[value="${h}"]`).prop('checked', true);
    });
  $("#disponibilidadVoluntario").val(usuario.disponibilidad);
}





$("#formActualizarVoluntario").submit(function(e) {
    e.preventDefault();

    let habilidades = [];

    $(".habilidad:checked").each(function() {
        habilidades.push($(this).val());
    });

    const disponibilidad = $("#disponibilidadVoluntario").val();

    if (habilidades.length === 0) {
        Swal.fire('Error', 'Selecciona al menos una habilidad', 'error');
        return;
    }

    $.ajax({
        url: APIUsuario + 'voluntario',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
          userId: usuario.id,
            habilidades,
            disponibilidad
        }),
        success: function(res) {
            Swal.fire('Éxito', 'Ahora eres voluntario 🎉', 'success');
        },
        error: function(err) {
            Swal.fire('Error', 'No se pudo actualizar', 'error');
        }
    });
});


$("#formActualizarPerfil").submit(function(e) {
    e.preventDefault();

    const nombre = $("#nombreCompletoActualizar").val();
    const email = $("#emailActualizar").val();
    const telefono = $("#telefonoActualizar").val();
    const cedula = $("#cedulaActualizar").val();
    const direccion = $("#direccionActualizar").val() || '';
    const provincia = $("#provinciaActualizar").val() || '';
    const pais = $("#paisActualizar").val() || '';

    if (!nombre || !email || !telefono || !cedula || !direccion || !provincia || !pais) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
    }

    $.ajax({
        url: APIUsuario + 'perfil',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            userId: usuario.id,
            nombre,
            email,
            telefono,
            cedula,
            direccion,
            provincia,
            pais
        }),
        success: function(res) {
            Swal.fire('Éxito', 'Perfil actualizado 🎉', 'success')
            .then(() => {

                // Actualizar datos en localStorage
                const usuarioActualizado = { ...usuario, nombre, email, telefono, cedula, direccion, provincia, pais };
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            });
        },
        error: function(err) {
            Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
        }
    });








});

});