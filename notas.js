// ============================================================
// ESTADO — "El cerebro de la app"
// Todo lo que existe en la app vive acá.
// En vez de guardar datos en el HTML, los guardamos en este
// objeto y después dibujamos el HTML a partir de él.
// ============================================================
let estados = {
  notas: [], // array de objetos nota
  tags: {}, // objeto donde cada key es el nombre del tag
  filtrosActivos: [], // array de nombres de tags activos como filtro
};

// ============================================================
// CONTADOR DE ID
// Cada nota necesita un id único para poder identificarla
// cuando la queremos completar, eliminar, etc.
// Se inicializa en 1 y se recalcula al cargar datos guardados.
// ============================================================
let contadorId = 1;

// ============================================================
// VARIABLE TEMPORAL — Tags elegidos al crear una nota
// Cuando el usuario abre el modal y elige tags, los guardamos
// acá hasta que confirma con "Guardar". Después se resetea.
// ============================================================
let tagsElegidos = [];

// ============================================================
// VARIABLE TEMPORAL — Color elegido al crear un tag
// Igual que tagsElegidos, guarda la elección del usuario
// hasta que confirma con "Crear Tag".
// ============================================================
let colorSeleccionado = "";

// ============================================================
// REFERENCIAS AL DOM
// Las guardamos en variables para no tener que buscarlas
// cada vez que las necesitamos. Es más eficiente y legible.
// ============================================================
const add = document.querySelector(".add");
const modal = document.querySelector(".modal");
const closeModal = document.getElementById("closeModal");
const tagAdd = document.querySelector(".tag-add");
const crearTag = document.querySelector(".crearTag");
const saveTag = document.getElementById("crearTag");
const selectColor = document.querySelectorAll(".sel-color");

// ============================================================
// EVENTOS DEL MODAL DE NOTA
// Abrir y cerrar el modal donde el usuario crea una nota nueva.
// ============================================================
add.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// ============================================================
// EVENTO — Mostrar/ocultar el formulario de crear tag
// El formulario de crear tag vive dentro del modal de nota.
// Al hacer click en "Agregar Tag" se muestra u oculta.
// ============================================================
tagAdd.addEventListener("click", () => {
  const estaVisible = crearTag.style.display === "flex";
  crearTag.style.display = estaVisible ? "none" : "flex";
});

// ============================================================
// EVENTO — Selección de color para un tag nuevo
// Recorremos todos los círculos de color.
// Al hacer click en uno, guardamos su data-color en
// colorSeleccionado y marcamos visualmente cuál está elegido.
// ============================================================
selectColor.forEach((color) => {
  color.addEventListener("click", function () {
    // Sacar la clase "elegido" de todos los colores
    selectColor.forEach((c) => c.classList.remove("elegido"));

    // Marcar solo el que se clickeó
    color.classList.add("elegido");

    // Guardar el color elegido (viene del atributo data-color en el HTML)
    colorSeleccionado = this.dataset.color;
  });
});

// ============================================================
// EVENTO — Crear un tag nuevo
// Valida que haya nombre y color, verifica que no exista ya,
// lo guarda en estados.tags y actualiza la pantalla.
// ============================================================
saveTag.addEventListener("click", () => {
  const nombre = document.getElementById("nombreTag").value;

  // Validar que ambos campos estén completos
  if (nombre === "" || colorSeleccionado === "") {
    alert("Rellena los campos");
    return; // salir sin hacer nada más
  }

  // Verificar que no exista un tag con ese nombre
  if (estados.tags[nombre]) {
    alert("Este tag ya existe");
    return;
  }

  // Guardar el tag nuevo en el estado
  // La key es el nombre y el valor es un objeto con el color
  estados.tags[nombre] = { color: colorSeleccionado };

  // Limpiar el formulario para el próximo tag
  document.getElementById("nombreTag").value = "";
  colorSeleccionado = "";
  selectColor.forEach((c) => c.classList.remove("elegido"));
  crearTag.style.display = "none";

  guardarEstado();
  renderizarTodo();
});

// ============================================================
// EVENTO — Guardar una nota nueva
// Toma los valores del formulario, crea el objeto nota,
// lo agrega al array de notas y limpia el formulario.
// ============================================================
document.getElementById("saveNote").addEventListener("click", () => {
  const titulo = document.getElementById("title").value;
  const contenido = document.getElementById("content").value;

  if (titulo === "") {
    alert("Poné un título");
    return;
  }

  // Crear el objeto nota y agregarlo al array
  estados.notas.push({
    id: contadorId++, // usamos el contador y lo incrementamos
    titulo,
    contenido,
    completada: false, // siempre arranca sin completar
    tags: [...tagsElegidos], // copiamos el array para que sea independiente
    //       ↑
    // El spread (...) crea una copia del array.
    // Sin esto, si tagsElegidos cambia después, la nota cambiaría también.
  });

  // Limpiar formulario y variables temporales
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  tagsElegidos = [];
  modal.style.display = "none";

  guardarEstado();
  renderizarTodo();
});

// ============================================================
// RENDER — Dibujar los tags en el modal de crear nota
// Estos son los círculos de color que el usuario puede elegir
// al crear una nota. Si está elegido, se marca visualmente.
// ============================================================
function renderizarTags() {
  const contenedor = document.querySelector(".modal-tags");

  // Object.entries() convierte el objeto tags en un array de pares
  // [nombre, datos] para poder recorrerlo con .map()
  contenedor.innerHTML = Object.entries(estados.tags)
    .map(([nombre, datos]) => {
      const estaElegido = tagsElegidos.includes(nombre);
      return `
        <div 
          class="tag-icon ${estaElegido ? "elegido" : ""}" 
          data-tag="${nombre}"
          title="${nombre}"
          style="background: ${datos.color}"
          onclick="toggleTagNota('${nombre}')"
        ></div>
      `;
    })
    .join(""); // join une el array en un string de HTML
}

// ============================================================
// RENDER — Dibujar los tags en la barra lateral (filtros)
// Cada tag es clickeable para activar/desactivar el filtro.
// Si está activo, se le agrega la clase "activo".
// El botón x elimina el tag con stopPropagation para que
// el click no active también el toggleFiltro del padre.
// ============================================================
function renderizarFiltros() {
  const contenedor = document.querySelector(".tags");

  contenedor.innerHTML = Object.entries(estados.tags)
    .map(
      ([nombre, datos]) => `
      <div class="tag ${estados.filtrosActivos.includes(nombre) ? "activo" : ""}" 
        onclick="toggleFiltro('${nombre}')">
        <div class="sel-color" style="background: ${datos.color};"></div>
        <div class="name-tag">${nombre}</div>
        <button onclick="event.stopPropagation(); eliminarTag('${nombre}')">x</button>
      </div>
    `,
    )
    .join("");
}

// ============================================================
// RENDER — Dibujar las notas en pantalla
// Primero filtra según filtrosActivos, luego convierte cada
// nota en HTML con su color, chips de tags y checkbox.
// ============================================================
function renderizarNotas() {
  const contenedor = document.querySelector(".tarjetas");

  // Si hay filtros activos, mostrar solo las notas que tengan
  // TODOS los tags del filtro (.every = AND, .some = OR)
  let notasAMostrar = estados.notas;

  if (estados.filtrosActivos.length > 0) {
    notasAMostrar = estados.notas.filter((nota) =>
      estados.filtrosActivos.every((filtro) => nota.tags.includes(filtro)),
    );
  }

  contenedor.innerHTML = notasAMostrar
    .map((nota) => {
      // El color de fondo viene del primer tag de la nota
      const tagPrimario = nota.tags[0];
      const color = estados.tags[tagPrimario]?.color || "#ccc";
      //                                       ↑
      // El ?. es "optional chaining": si el tag no existe en
      // estados.tags, devuelve undefined en vez de tirar error.
      // El || "#ccc" es el fallback si no hay color.

      // Convertir los tags de la nota en chips de colores
      const chipsHTML = nota.tags
        .map((tag) => {
          const colorChip = estados.tags[tag]?.color || "#ccc";
          return `<span class="chip" style="background: ${colorChip}">${tag}</span>`;
        })
        .join("");

      return `
        <div class="card ${nota.completada ? "completada" : ""}" style="background: ${color}">
          <div class="header-card">
            <span>${nota.titulo}</span>
            <div class="actions-card" onclick="eliminarNota(${nota.id})">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/>
              </svg>
            </div>
          </div>
          <div class="body-card">${nota.contenido}</div>
          <div class="footer-card">
            <div class="tag-card">${chipsHTML}</div>
            <div class="check">
              <label>${nota.completada ? "Completada ✓" : "Hecho:"}</label>
              <input type="checkbox" ${nota.completada ? "checked" : ""} onchange="toggleCompletar(${nota.id})">
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ============================================================
// RENDER — Función principal que redibuja toda la pantalla
// Se llama cada vez que el estado cambia. Llama a las tres
// funciones de render en orden.
// ============================================================
function renderizarTodo() {
  renderizarTags();
  renderizarFiltros();
  renderizarNotas();
}

// ============================================================
// DATOS — Guardar el estado en localStorage
// localStorage solo acepta strings, por eso usamos
// JSON.stringify() para convertir los objetos a texto.
// ============================================================
function guardarEstado() {
  localStorage.setItem("notas", JSON.stringify(estados.notas));
  localStorage.setItem("tags", JSON.stringify(estados.tags));
}

// ============================================================
// DATOS — Cargar el estado desde localStorage
// JSON.parse() convierte el texto guardado de vuelta a objeto.
// Si no hay nada guardado, getItem() devuelve null y el if
// no se ejecuta, quedando los valores por defecto del estado.
// El contadorId se calcula DESPUÉS de cargar las notas para
// que tome el id más alto existente y continúe desde ahí.
// ============================================================
function cargarEstado() {
  const notasGuardadas = localStorage.getItem("notas");
  const tagsGuardados = localStorage.getItem("tags");

  if (notasGuardadas) estados.notas = JSON.parse(notasGuardadas);
  if (tagsGuardados) estados.tags = JSON.parse(tagsGuardados);

  // Calcular el próximo id disponible basado en los ids existentes
  // Math.max(...array) busca el número más grande del array
  contadorId =
    estados.notas.length > 0
      ? Math.max(...estados.notas.map((n) => n.id)) + 1
      : 1;
}

// ============================================================
// ACCIONES — Marcar/desmarcar una nota como completada
// Busca la nota por id y invierte su valor de completada.
// !false = true / !true = false
// ============================================================
function toggleCompletar(id) {
  const nota = estados.notas.find((n) => n.id === id);
  nota.completada = !nota.completada;
  guardarEstado();
  renderizarTodo();
}

// ============================================================
// ACCIONES — Activar/desactivar un filtro de tag
// Si el tag ya estaba activo lo saca del array con .filter().
// Si no estaba activo lo agrega con .push().
// Después redibuja para que las notas se filtren.
// ============================================================
function toggleFiltro(nombre) {
  const yaActivo = estados.filtrosActivos.includes(nombre);

  if (yaActivo) {
    // .filter() devuelve un array nuevo SIN el elemento que no queremos
    estados.filtrosActivos = estados.filtrosActivos.filter((t) => t !== nombre);
  } else {
    estados.filtrosActivos.push(nombre);
  }

  renderizarTodo();
}

// ============================================================
// ACCIONES — Elegir/deseleccionar un tag al crear una nota
// Igual que toggleFiltro pero para tagsElegidos.
// Solo redibuja los tags del modal, no toda la pantalla.
// ============================================================
function toggleTagNota(nombre) {
  const yaElegido = tagsElegidos.includes(nombre);

  if (yaElegido) {
    tagsElegidos = tagsElegidos.filter((t) => t !== nombre);
  } else {
    tagsElegidos.push(nombre);
  }

  // Solo redibujamos los tags del modal, no toda la pantalla
  renderizarTags();
}

// ============================================================
// ACCIONES — Eliminar un tag
// 1. Lo borra del registro global de tags
// 2. Lo saca de todas las notas que lo tenían
// 3. Lo saca de los filtros activos si estaba ahí
// ============================================================
function eliminarTag(nombre) {
  // delete elimina una propiedad de un objeto
  delete estados.tags[nombre];

  // Sacar el tag de todas las notas que lo tenían
  estados.notas.forEach((nota) => {
    nota.tags = nota.tags.filter((t) => t !== nombre);
  });

  // Sacar el tag de los filtros activos si estaba
  estados.filtrosActivos = estados.filtrosActivos.filter((t) => t !== nombre);

  guardarEstado();
  renderizarTodo();
}

// ============================================================
// ACCIONES — Eliminar una nota
// .filter() devuelve un array nuevo con todas las notas
// EXCEPTO la que tiene el id que queremos eliminar.
// ============================================================
function eliminarNota(id) {
  estados.notas = estados.notas.filter((n) => n.id !== id);
  guardarEstado();
  renderizarTodo();
}

// ============================================================
// ARRANQUE — Se ejecuta cuando carga la página
// Primero carga los datos guardados, luego dibuja todo.
// El orden importa: cargar antes de dibujar.
// ============================================================
cargarEstado();
renderizarTodo();
