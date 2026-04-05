const APIRegistro = 'http://localhost:3000/api/usuarios/';



$(document).ready(function() {

$('#cerrarSesion').click(function(e) {
  e.preventDefault();

  Swal.fire({
    title: '¿Cerrar sesión?',
    text: 'Tu sesión se cerrará',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      
      // 🔥 borrar sesión
      localStorage.removeItem('usuario');

      // redirigir
      window.location.href = '/login';
    }
  });
});
 
$("#formRegistro").submit(function(event) {
    event.preventDefault();

    const btn = $(this).find('button');
    btn.prop('disabled', true);

    const nombre = $("#nombreRegistro").val();
    const email = $("#emailRegistro").val();
    const password = $("#passwordRegistro").val();
    const telefono = $("#telefonoRegistro").val();
    const cedula = $("#cedulaRegistro").val();
    const passwordConfirmacion = $("#passwordConfirmacion").val();

    if(!nombre || !email || !password || !telefono || !cedula || !passwordConfirmacion) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        btn.prop('disabled', false);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire('Error', 'Correo electrónico no válido', 'error');
        btn.prop('disabled', false);
        return;
    }

    if(password.length < 9) {
        Swal.fire('Error', 'La contraseña debe tener al menos 9 caracteres', 'error');
        btn.prop('disabled', false);
        return;
    }

    if(password !== passwordConfirmacion) {
        Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
        btn.prop('disabled', false);
        return;
    }

    $.ajax({
        url: APIRegistro + 'registro',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ nombre, email, password, telefono, cedula }),

        success: function(response) {
            Swal.fire('¡Registro exitoso!', response.message, 'success')
            .then(() => {
                window.location.href = '/login';
            });
        },

        error: function(err) {
            Swal.fire('Error', err.responseJSON?.message || 'Error en el servidor', 'error');
        },

        complete: function() {
            btn.prop('disabled', false);
        }
    });

});

$("#formLogin").submit(function(event) {
    event.preventDefault();
    const btn = $(this).find('button');
    btn.prop('disabled', true);
    const email = $("#emailLogin").val();
    const password = $("#passwordLogin").val();

    if(!email || !password) {
        Swal.fire('Error', 'Email y contraseña son obligatorios', 'error');
        btn.prop('disabled', false);
        return;
    }

    $.ajax({
        url: APIRegistro + 'login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function(response) {
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            console.log('Usuario logueado:', response.usuario);
            Swal.fire('¡Login exitoso!', response.message, 'success')
            .then(() => {
                window.location.href = '/index';
            });
        },
        error: function(err) {
            Swal.fire('Error', err.responseJSON?.message || 'Error en el servidor', 'error');
        },
        complete: function() {
            btn.prop('disabled', false);
        }
    });

});

const usuario = JSON.parse(localStorage.getItem('usuario'));

console.log('Usuario en localStorage:', usuario);
  if (usuario) {
    $("#labelNombre").text(usuario.nombre);
    $("#labelRol").text("Rol: " + usuario.rol);
  } 

});