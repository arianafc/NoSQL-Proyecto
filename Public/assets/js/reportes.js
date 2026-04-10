$(document).ready(function() {

    $("#btnGenerarReporte").click(function() {

        $("#generarReporte").removeClass('d-none');
        $(this).addClass('d-none');

    });
    
    


    $("#previewImagen, #btnSeleccionarImagen").click(function () {
  $("#evidencias").click();
});

$("#evidencias").change(function (e) {
  const files = e.target.files;

  $("#previewContainer").html(""); // limpiar

  Array.from(files).forEach(file => {
    const reader = new FileReader();

    reader.onload = function (e) {

      let element;

      if (file.type.startsWith("image")) {
        element = `<img src="${e.target.result}" 
                    style="width:120px;height:120px;object-fit:cover;margin:5px;border-radius:8px;">`;
      } else {
        element = `<video src="${e.target.result}" 
                    style="width:120px;height:120px;margin:5px;" controls></video>`;
      }

      $("#previewContainer").append(element);
    };

    reader.readAsDataURL(file);
  });
});
});