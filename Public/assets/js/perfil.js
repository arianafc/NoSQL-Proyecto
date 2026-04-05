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

});