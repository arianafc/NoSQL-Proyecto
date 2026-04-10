let evidenciasAEliminar = [];
const usuario = JSON.parse(localStorage.getItem("usuario"));

function getEstadoBadge(estado) {
  switch (estado) {
    case "Pendiente":
      return '<span class="badge bg-warning">Pendiente</span>';
    case "En Revision":
      return '<span class="badge bg-info">En Revisión</span>';
    case "Resuelto":
      return '<span class="badge bg-success">Resuelto</span>';
    case "Transferido":
      return '<span class="badge bg-primary">Transferido</span>';
    case "Cancelado":
      return '<span class="badge bg-danger">Cancelado</span>';
    default:
      return `<span class="badge bg-secondary">${estado}</span>`;
  }
}


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

        let urgenciaBadge = rep.urgencia === 'Alta'
          ? '<span class="badge bg-danger">Alta</span>'
          : rep.urgencia === 'Media'
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
            <td>${rep.organizacion?.nombre ?? 'Sin asignar'}</td>
             <td>${getEstadoBadge(rep.estado)}</td>
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

function cargarReportes() {

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    Swal.fire("Error", "Debe iniciar sesión", "error");
    window.location.href = "/login";
    return;
  }

  $.ajax({
    url: `/api/reportes/`, 
    method: "GET",

    success: function (reportes) {
      const tabla = $("#tablaReportes");
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

        let urgenciaBadge = rep.urgencia === 'Alta'
          ? '<span class="badge bg-danger">Alta</span>'
          : rep.urgencia === 'Media'
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
            <td>${rep.usuario.nombre}</td>
            <td>${rep.descripcion}</td>
            <td>${rep.ubicacion}</td>
            <td>${urgenciaBadge}</td>
           <td>${rep.organizacion?.nombre ?? 'Sin asignar'}</td>
            <td>${getEstadoBadge(rep.estado)}</td>
            <td>${new Date(rep.fecha).toLocaleDateString("es-CR")}</td>
            <td>${evidenciasHTML}</td>
           <td>
  <button 
    class="btn btn-sm btn-info btnVerAdmin col-md-12 mb-2" 
    data-id="${rep._id}" 
    data-contacto="${rep.usuario.correo}" 
    data-telefono="${rep.usuario.telefono}">
    Ver
  </button>

  <button 
    class="btn btn-sm btn-warning btnAsignar col-md-12 mb-2" 
    data-id="${rep._id}">
    Asignar
  </button>

  <button 
    class="btn btn-sm btn-success btnAgregarNotas col-md-12 mb-2" 
    data-id="${rep._id}">
    Notas
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

function verNotas(idReporte) {
  $.get(`/api/reportes/notas/` + idReporte, function (notas) {

    let html = `
      <div style="
        max-height: 400px;
        overflow-y: auto;
        padding-right: 5px;
      ">
    `;

    if (notas.length === 0) {
      html += `
        <p class="text-muted text-center">
          No hay notas registradas
        </p>
      `;
    } else {
      notas.forEach(nota => {
        html += `
          <div style="
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 12px 15px;
            margin-bottom: 10px;
            background-color: #f9f9f9;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            text-align: left;
          ">
            <p style="
              margin-bottom: 8px;
              font-size: 14px;
              color: #333;
            ">
              ${nota.mensaje}
            </p>

            <div style="
              font-size: 12px;
              color: #777;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <span>
                <strong>${nota.autor.nombre}</strong>
              </span>
              <span>
                ${new Date(nota.fecha).toLocaleString()}
              </span>
            </div>
          </div>
        `;
      });
    }

    html += `</div>`;

    Swal.fire({
      title: "📝 Notas del reporte",
      html: html,
      width: "650px",
      confirmButtonText: "Cerrar",
      focusConfirm: false
    });
  })
  .fail(function (err) {
    Swal.fire(
      "Error",
      err.responseJSON?.error || "No se pudieron cargar las notas",
      "error"
    );
  });
}

function renderOrganizaciones(organizaciones) {
  let html = "";

  if (!organizaciones || organizaciones.length === 0) {
    html = `
      <div class="col-12 text-center text-muted">
        No se encontraron organizaciones
      </div>
    `;
  } else {
    organizaciones.forEach(org => {
      html += `
        <div class="col-md-6">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">

              <h6 class="card-title fw-bold mb-1">
                ${org.nombre}
              </h6>

              <p class="card-text small text-muted mb-2">
                ${org.descripcion || "Sin descripción"}
              </p>

              <p class="small mb-2">
                📍 ${org.direccion}
              </p>

              <button
                class="btn btn-success btn-sm mt-auto btnConfirmarAsignacion"
                data-id-org="${org._id}"
                >
                Asignar
              </button>

            </div>
          </div>
        </div>
      `;
    });
  }

  $("#contenedorOrganizaciones").html(html);
}

$(document).ready(function () {


  if(usuario.rol === "usuario") {
      cargarMisReportes();
  } else if (usuario.rol === "admin") {
      cargarReportes();
  }
    

 $(document).on("click", ".btnAsignar", function () {
  
  const idReporte = $(this).data("id");
  $("#modalAsignarOrganizacion").data("id-reporte", idReporte);
  
  $("#contenedorOrganizaciones").html(`
    <div class="text-center text-muted">
      Cargando organizaciones sugeridas...
    </div>
  `);

  $("#modalAsignarOrganizacion").modal("show");

  $.get(`/api/reportes/organizaciones/${idReporte}`, function (response) {
    renderOrganizaciones(response.sugeridas);
  });
});

$(document).on("click", "#obtenerTodasOrganizaciones", function () {


  $("#contenedorOrganizaciones").html(`
    <div class="text-center text-muted">
      Cargando todas las organizaciones...
    </div>
  `);

  $.get(`/admin/organizacionesAsignar`, function (organizaciones) {
   
    renderOrganizaciones(organizaciones);
  });
});

$(document).on("click", ".btnConfirmarAsignacion", function () {

  const idReporte = $("#modalAsignarOrganizacion").data("id-reporte")
  const idOrganizacion = $(this).data("id-org");

  $.ajax({
  url: "/api/reportes/asignarOrganizacion",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify({
    idReporte,
    idOrganizacion
  }),
  success: function () {
    $("#modalAsignarOrganizacion").modal("hide");

    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Organización asignada correctamente"
    }).then(() => {
      location.reload();
    });
  },
  error: function () {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo asignar la organización"
    });
  }
});
 
});

$("#btnVerNotas").click(function(){
  const idReporte = $(this).data("id");
  $("#modalDetalleReporte").modal("hide");
  verNotas(idReporte);
});

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

$(document).on("click", ".btnAgregarNotas", function () {

  const idReporte = $(this).data("id");
  const idUsuario = usuario.id;
  const nombre = usuario.nombre;

  Swal.fire({
    title: "Agregar nota",
    input: "textarea",
    inputLabel: "Nota",
    inputPlaceholder: "Escriba la nota...",
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    inputValidator: (value) => {
      if (!value) {
        return "La nota no puede estar vacía";
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {

      $.ajax({
        url: `/api/reportes/notas/`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          idReporte: idReporte,
          nota: result.value,
          autorId: idUsuario,
          autorNombre: nombre
        }),
        success: function (response) {
          Swal.fire("Éxito", response.message, "success");
        },
        error: function (err) {
          Swal.fire(
            "Error",
            err.responseJSON?.error || "No se pudo agregar la nota",
            "error"
          );
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
    const estado = $("#inputEstado").length ? $("#inputEstado").val() : $("#detalleEstado").text();
    const descripcion = $("#inputDescripcion").length ? $("#inputDescripcion").val() : $("#detalleDescripcion").text();
    const ubicacion   = $("#inputUbicacion").length ? $("#inputUbicacion").val() : $("#detalleUbicacion").text();
    const provincia   = $("#inputProvincia").length ? $("#inputProvincia").val() : $("#detalleProvincia").text();
    const urgencia    = $("#inputUrgencia").length ? $("#inputUrgencia").val() : $("#detalleUrgencia").text();

  formData.append("estado", estado);  
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
   $("#modalDetalleReporte").modal("show");

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
        $("#btnVerNotas").removeClass("d-none").data("id", rep._id);

   

    }

    
  });

});


$("#btnEditarDatos").click(function() {

  if(usuario.rol === "admin") {
    const estado = $("#detalleEstado").text();
    $("#detalleEstado").html(`
    <select id="inputEstado" class="form-control">
      <option value="Pendiente" ${estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
      <option value="En Revision" ${estado === 'En Revision' ? 'selected' : ''}>En Revisión</option>
      <option value="Resuelto" ${estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
      <option value="Transferido" ${estado === 'Transferido' ? 'selected' : ''}>Transferido</option>
      <option value="Cancelado" ${estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
    </select>
  `);
  }

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
      <option value="Baja" ${urgencia === 'Baja' ? 'selected' : ''}>Baja</option>
      <option value="Media" ${urgencia === 'Media' ? 'selected' : ''}>Media</option>
      <option value="Alta" ${urgencia === 'Alta' ? 'selected' : ''}>Alta</option>
    </select>
  `);
  // Alternar botones
  $("#btnEditarDatos").addClass("d-none");
  $("#btnEditarReporte").removeClass("d-none");
  $("#btnCancelarReporte").removeClass("d-none");
});


$(document).on("click", ".btnVerAdmin", function () {

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

      
  
        $("#btnEditarReporte").removeClass("d-none").data("id", rep._id);
        $("#btnCancelarReporte").removeClass("d-none").data("id", rep._id);
        $("#btnEditarDatos").removeClass("d-none").data("id", rep._id);
        $("#btnVerNotas").removeClass("d-none").data("id", rep._id);

      $("#modalDetalleReporte").modal("show");

    }
  });

});



});