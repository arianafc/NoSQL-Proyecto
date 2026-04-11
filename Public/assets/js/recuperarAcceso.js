
$(document).ready(function(){

  
document.getElementById("formAuthentication").addEventListener("submit", function (e) {
  e.preventDefault(); 

  const email = $("#emailRecuperarAcceso").val();

  console.log("Correo ingresado:", email);

fetch("/api/usuarios/recuperarContrasenna", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    correo: email
  })
})
  .then(res => res.json())
  .then(data => {
    Swal.fire({
      icon: "success",
      title: "Recuperación de contraseña",
      text: data.message
    }).then(() => {
      
      window.location.href = "/";
   
    });
  
  })
  .catch(error => {
    console.error("Error en la solicitud:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo procesar la solicitud. Inténtalo más tarde."
    });
  });


});

});