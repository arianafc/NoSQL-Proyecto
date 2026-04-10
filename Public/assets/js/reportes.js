let evidenciasAEliminar = [];

function cargarMisReportes() {

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const usuarioId = usuario.id;


  if (!usuario) {
    Swal.fire("Error", "Debe iniciar sesión", "error");
    window.location.href = "/login";
    return;
  }

  $.ajax({
    url: `/api/reportes/misReportes/` + usuarioId, 
    method: "GET",

    success: function (reportes) {
      const tabla = $("#tablaMisReportes");
      tabla.html("");

      if (!reportes.length) {
        tabla.append(`
          <tr>
            <td colspan="7" class="text-center">No tienes reportes 🐾</td>
          </tr>
        `);
        return;
      }

      reportes.forEach(rep => {

        let urgenciaBadge = rep.urgencia === 'alta'
          ? '<span class="badge bg-danger">Alta</span>'
          : rep.urgencia === 'media'
          ? '<span class="badge bg-warning">Media</span>'
          : '<span class="badge bg-success">Baja</span>';

        let evidenciasHTML = '';

        if (rep.evidencias?.length) {
          evidenciasHTML = 'Evidencias Adjuntas: ' + rep.evidencias.length;
        } else {
          evidenciasHTML = 'Sin evidencia';
        }

        const fila = `
          <tr>
            <td>${rep.descripcion}</td>
            <td>${rep.ubicacion}</td>
            <td>${urgenciaBadge}</td>
            <td>${rep.asignado || 'Sin asignar'}</td>
            <td>${rep.estado || 'Pendiente'}</td>
            <td>${new Date(rep.fecha).toLocaleDateString("es-CR")}</td>
            <td>${evidenciasHTML}</td>
            <td>
                <button class="btn btn-sm btn-info btnVer" data-id="${rep._id}">
  Ver
</button>
            
            </td>
          </tr>
        `;

        tabla.append(fila);
      });
    },

    error: function (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los reportes", "error");
    }
  });
}

$(document).ready(function () {
    
    cargarMisReportes();

    $(document).on("click", "#btnCancelarReporte", function () {

$("#modalDetalleReporte").modal("hide");
  const id = $(this).data("id");

  Swal.fire({
    title: "¿Cancelar reporte?",
    icon: "warning",
    showCancelButton: true
  }).then(result => {

    if (result.isConfirmed) {

      $.ajax({
        url: `/api/reportes/cancelar/${id}`,
        method: "PUT",
        success: function () {
          Swal.fire("Cancelado", "", "success");
          $("#modalDetalleReporte").modal("hide");
          cargarMisReportes();
          $("#detalleDescripcion").text($("#inputDescripcion").attr("value"));
  $("#detalleUbicacion").text($("#inputUbicacion").attr("value"));
  $("#detalleProvincia").text($("#inputProvincia").val());
  $("#detalleUrgencia").text($("#inputUrgencia").attr("value"));
   $("#btnEditarReporte").addClass("d-none");
  $("#btnCancelarReporte").addClass("d-none");
  $("#btnEditarDatos").removeClass("d-none");
        }
      });

    }

  });

});



$(document).on("click", ".btnEliminarEvidencia", function () {

  const url = $(this).data("url");

  evidenciasAEliminar.push(url);

  $(this).parent().remove();

});

$(document).on("click", "#btnEditarReporte", function () {

  const id = $(this).data("id");
  const nuevas = $("#nuevasEvidencias")[0].files;

  const formData = new FormData();

    const descripcion = $("#inputDescripcion").length ? $("#inputDescripcion").val() : $("#detalleDescripcion").text();
  const ubicacion   = $("#inputUbicacion").length ? $("#inputUbicacion").val() : $("#detalleUbicacion").text();
  const provincia   = $("#inputProvincia").length ? $("#inputProvincia").val() : $("#detalleProvincia").text();
  const urgencia    = $("#inputUrgencia").length ? $("#inputUrgencia").val() : $("#detalleUrgencia").text();

  formData.append("descripcion", descripcion);
  formData.append("ubicacion", ubicacion);
  formData.append("provincia", provincia);
  formData.append("urgencia", urgencia);

    formData.append("eliminar", JSON.stringify(evidenciasAEliminar));

  for (let i = 0; i < nuevas.length; i++) {
    formData.append("evidencias", nuevas[i]);
  }

  $.ajax({
    url: `/api/reportes/${id}`,
    method: "PUT",
    data: formData,
    processData: false,
    contentType: false,

    success: function () {
      Swal.fire("Éxito", "Reporte actualizado", "success")
      .then(() => {
         $("#detalleDescripcion").text($("#inputDescripcion").val());
        $("#detalleUbicacion").text($("#inputUbicacion").val());
        $("#detalleProvincia").text($("#inputProvincia").val());
        $("#detalleUrgencia").text($("#inputUrgencia").val());

        // Alternar botones
        $("#btnEditarReporte").addClass("d-none");
        $("#btnCancelarReporte").addClass("d-none");
        $("#btnEditarDatos").removeClass("d-none");
        location.reload();
      });
      $("#modalDetalleReporte").modal("hide");

    }, 

    error: function () {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  });

});

  $("#btnGenerarReporte").click(function(){
    $("#generarReporte").removeClass("d-none");
    $(this).addClass("d-none");
    $("#seguimientoCasos").addClass("d-none");
    $("#verMisReportes").removeClass("d-none");
  });

  $("#verMisReportes").click(function(){
    $(this).addClass("d-none");
    $("#generarReporte").addClass("d-none");
    $("#btnGenerarReporte").removeClass("d-none");
    $("#seguimientoCasos").removeClass("d-none");
  });

  const inputFile = $("#evidencias");
  const previewContainer = $("#previewContainer");

  $("#btnSeleccionarImagen").click(function () {
    inputFile.click();
  });

  inputFile.on("change", function () {
    previewContainer.html("");

    const files = this.files;

    if (!files.length) return;

    Array.from(files).forEach(file => {

      const reader = new FileReader();

      reader.onload = function (e) {
        let element;

        if (file.type.startsWith("image/")) {
          element = `<img src="${e.target.result}" width="120" class="m-2 rounded shadow"/>`;
        } else if (file.type.startsWith("video/")) {
          element = `
            <video width="120" class="m-2 rounded shadow" controls>
              <source src="${e.target.result}" type="${file.type}">
            </video>
          `;
        }

        previewContainer.append(element);
      };

      reader.readAsDataURL(file);
    });
  });

  $("#formGenerarReporte").submit(function (e) {
    e.preventDefault();

    const descripcion = $("#descripcion").val();
    const urgencia = $("#urgencia").val();
    const provincia = $("#provinciaReporte").val();
    const ubicacion = $("#ubicacionReporte").val();

    const files = inputFile[0].files;

    if (!descripcion || !provincia || !ubicacion) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

  
    const formData = new FormData();

    formData.append("descripcion", descripcion);
    formData.append("urgencia", urgencia);
    formData.append("provincia", provincia);
    formData.append("ubicacion", ubicacion);

  
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      Swal.fire("Error", "Debe iniciar sesión", "error");
      window.location.href = "/login";
      return;
    }

    formData.append("usuarioId", usuario.id);

    for (let i = 0; i < files.length; i++) {
      formData.append("evidencias", files[i]);
    }


    $.ajax({
      url: "/api/reportes",
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (res) {
        Swal.fire("Éxito 🐾", res.message, "success");

        $("#formGenerarReporte")[0].reset();
        previewContainer.html("");
        location.reload();
      },
      error: function (err) {
        console.error(err);

        Swal.fire(
          "Error",
          err.responseJSON?.error || "Error al crear reporte",
          "error"
        );
      }
    });

  });

  $(document).on("click", ".btnVer", function () {

  const id = $(this).data("id");

  $.ajax({
    url: `/api/reportes/${id}`,
    method: "GET",

    success: function (rep) {

      $("#detalleDescripcion").text(rep.descripcion);
      $("#detalleUbicacion").text(rep.ubicacion);
      $("#detalleProvincia").text(rep.provincia);
      $("#detalleUrgencia").text(rep.urgencia);
      $("#detalleEstado").text(rep.estado || "Pendiente");

      let html = "";

  rep.evidencias?.forEach(ev => {

    html += `
      <div class="position-relative m-2">

        ${
          ev.match(/\.(mp4|webm|ogg)$/i)
            ? `<video width="120" controls><source src="${ev}"></video>`
            : `<img src="${ev}" width="120" class="rounded"/>`
        }

        <button class="btn btn-danger btn-sm position-absolute top-0 end-0 btnEliminarEvidencia" data-url="${ev}">
          X
        </button>

      </div>
    `;
  });

  $("#contenedorEvidenciasActuales").html(html);

      
      if (!rep.estado || rep.estado === "pendiente" || rep.estado === "Pendiente") {
        $("#btnEditarReporte").removeClass("d-none").data("id", rep._id);
        $("#btnCancelarReporte").removeClass("d-none").data("id", rep._id);
        $("#btnEditarDatos").removeClass("d-none").data("id", rep._id);
      } else {
        $("#btnEditarReporte").addClass("d-none");
        $("#btnCancelarReporte").addClass("d-none");
        $("#btnEditarDatos").addClass("d-none");
        $(
            ".nuevasEvidencias"
        ).addClass("d-none");
      }

      $("#modalDetalleReporte").modal("show");

    }
  });

});


$("#btnEditarDatos").click(function() {


  // Obtener valores actuales
  const descripcion = $("#detalleDescripcion").text();
  const ubicacion = $("#detalleUbicacion").text();
  const provincia = $("#detalleProvincia").text();
  const urgencia = $("#detalleUrgencia").text();

  // Reemplazar por inputs
  $("#detalleDescripcion").html(`
    <input type="text" id="inputDescripcion" class="form-control" value="${descripcion}">
  `);

  $("#detalleUbicacion").html(`
    <input type="text" id="inputUbicacion" class="form-control" value="${ubicacion}">
  `);

  $("#detalleProvincia").html(`
  <select class="form-control" id="inputProvincia">
    <option value="San José">San José</option>
    <option value="Alajuela">Alajuela</option>
    <option value="Cartago">Cartago</option>
    <option value="Heredia">Heredia</option>
    <option value="Guanacaste">Guanacaste</option>
    <option value="Puntarenas">Puntarenas</option>
    <option value="Limón">Limón</option>
  </select>
`);


$("#inputProvincia").val(provincia);


  $("#detalleUrgencia").html(`
    <select id="inputUrgencia" class="form-control">
      <option value="baja" ${urgencia === 'baja' ? 'selected' : ''}>Baja</option>
      <option value="media" ${urgencia === 'media' ? 'selected' : ''}>Media</option>
      <option value="alta" ${urgencia === 'alta' ? 'selected' : ''}>Alta</option>
    </select>
  `);
  // Alternar botones
  $("#btnEditarDatos").addClass("d-none");
  $("#btnEditarReporte").removeClass("d-none");
  $("#btnCancelarReporte").removeClass("d-none");
});

});