const API = '/api/usuarios';

document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
});

function cargarUsuarios() {
  fetch(API)
    .then(res => res.json())
    .then(data => {
      const tabla = document.getElementById("tablaUsuarios");
      tabla.innerHTML = "";

      data.forEach(u => {
        tabla.innerHTML += `
          <tr>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>${u.telefono}</td>

            <td>
              <select class="form-select form-select-sm"
                onchange="cambiarRol('${u._id}', this.value)">
                
                <option value="Usuario" ${u.rol === 'Usuario' ? 'selected' : ''}>Usuario</option>
                <option value="Admin" ${u.rol === 'Admin' ? 'selected' : ''}>Admin</option>
                <option value="Organizacion" ${u.rol === 'Organizacion' ? 'selected' : ''}>Organización</option>

              </select>
            </td>

            <td>
              <span class="${u.estado ? 'text-success' : 'text-danger'}">
                ${u.estado ? 'Activo' : 'Inactivo'}
              </span>
            </td>

            <td>
              <button class="btn btn-sm ${u.estado ? 'btn-danger' : 'btn-success'}"
                onclick="toggleEstado('${u._id}', ${u.estado})">
                ${u.estado ? 'Desactivar' : 'Activar'}
              </button>
            </td>
          </tr>
        `;
      });
    });
}

// 🔥 CAMBIAR ROL
function cambiarRol(id, rol) {
  fetch(`${API}/rol/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rol })
  })
  .then(res => res.json())
  .then(() => {
    console.log("Rol actualizado");
  })
  .catch(err => console.error(err));
}

// 🔥 CAMBIAR ESTADO
function toggleEstado(id, estadoActual) {
  fetch(`${API}/estado/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: !estadoActual })
  })
  .then(res => res.json())
  .then(() => {
    cargarUsuarios();
  })
  .catch(err => console.error(err));
}