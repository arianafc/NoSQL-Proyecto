const APIUsuario = 'http://localhost:3000/api/usuarios/';


$(document).ready(function() {
 
$('#activarVoluntariado').change(function() {
  if ($(this).is(':checked')) {
    console.log('Voluntariado activado');
    $("#formActualizarVoluntario").removeClass('d-none');
  } else {
    console.log('Voluntariado desactivado');
    $("#formActualizarVoluntario").addClass('d-none');
}   
});

const usuario = JSON.parse(localStorage.getItem('usuario'));

$("#nombreCompletoActualizar").val(usuario.nombre);
$("#emailActualizar").val(usuario.email);
$("#telefonoActualizar").val(usuario.telefono);
$("#cedulaActualizar").val(usuario.cedula);


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












});