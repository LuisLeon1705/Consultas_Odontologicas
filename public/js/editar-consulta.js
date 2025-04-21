document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("consulta-form")
  const loadingIndicator = document.getElementById("loading-indicator")
  const errorMessage = document.getElementById("error-message")
  const pageTitle = document.getElementById("page-title")
  const backLink = document.getElementById("back-link")
  const cancelLink = document.getElementById("cancel-link")
  const consultaIdInput = document.getElementById("consulta-id")
  const pacienteIdInput = document.getElementById("paciente-id")
  const pacienteNombre = document.getElementById("paciente-nombre")
  const pacienteCedula = document.getElementById("paciente-cedula")
  const fechaConsulta = document.getElementById("fecha-consulta")
  const odontologoSelect = document.getElementById("odontologo-select")
  const motivoTextarea = document.getElementById("motivo")
  const odontologoForm = document.getElementById("odontologo-form")
  const guardarOdontologoBtn = document.getElementById("guardar-odontologo-btn")
  const nuevoOdontologoModal = new bootstrap.Modal(document.getElementById("nuevoOdontologoModal"))

  // Obtener el ID de la consulta de la URL
  const consultaId = window.location.pathname.split("/")[2]

  // Actualizar los enlaces
  backLink.href = `/consultas-odontologicas/${consultaId}`
  cancelLink.href = `/consultas-odontologicas/${consultaId}`

  // Cargar odontólogos
  loadOdontologos()

  // Cargar los datos de la consulta
  loadConsulta(consultaId)

  // Guardar odontólogo button click event
  guardarOdontologoBtn.addEventListener("click", () => {
    if (!odontologoForm.checkValidity()) {
      odontologoForm.classList.add("was-validated")
      return
    }

    // Get form data
    const formData = new FormData(odontologoForm)
    const tipoCedula = formData.get("tipo_cedula")
    const cedula = formData.get("cedula")

    // Create odontólogo object
    const odontologo = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      cedula: `${tipoCedula}${cedula}`,
      cargo: formData.get("cargo") || "General",
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      fecha_nacimiento: formData.get("fecha_nacimiento"),
      fecha_contratacion: formData.get("fecha_contratacion"),
      direccion: formData.get("direccion"),
      cargo: "Odontólogo",
    }

    // Submit data
    createOdontologo(odontologo)
  })

  // Form submit event
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!form.checkValidity()) {
      e.stopPropagation()
      form.classList.add("was-validated")
      return
    }

    // Get form data
    const formData = new FormData(form)

    // Add odontodiagrama data
    const odontodiagrama = document.getElementById("odontodiagrama").value

    // Create consulta object
    const consulta = {
      odontologo_id: Number.parseInt(formData.get("odontologo_id")),
      motivo: formData.get("motivo"),
      odontodiagrama: JSON.parse(odontodiagrama),
    }

    // Submit data
    updateConsulta(consultaId, consulta)
  })

  // Función para cargar los datos de la consulta
  async function loadConsulta(id) {
    try {
      const response = await fetch(`/api/consultas/${id}`)

      if (!response.ok) {
        throw new Error("Error al cargar la consulta")
      }

      const consulta = await response.json()

      // Actualizar el título de la página
      pageTitle.textContent = `Editar Consulta #${consulta.id}`

      // Guardar IDs
      consultaIdInput.value = consulta.id
      pacienteIdInput.value = consulta.paciente_id

      // Mostrar la información del paciente
      pacienteNombre.textContent = `${consulta.paciente_nombre} ${consulta.paciente_apellido}`
      pacienteCedula.textContent = consulta.paciente_cedula

      // Formatear y mostrar la fecha
      const fecha = new Date(consulta.fecha)
      fechaConsulta.textContent = fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      // Seleccionar el odontólogo
      odontologoSelect.value = consulta.odontologo_id

      // Mostrar el motivo de la consulta
      motivoTextarea.value = consulta.motivo

      // Si hay odontodiagrama, inicializarlo
      if (consulta.odontodiagrama) {
        initOdontodiagrama(consulta.odontodiagrama)
      }

      // Ocultar el indicador de carga y mostrar el formulario
      loadingIndicator.classList.add("d-none")
      form.classList.remove("d-none")
    } catch (error) {
      console.error("Error al cargar la consulta:", error)
      loadingIndicator.classList.add("d-none")
      errorMessage.classList.remove("d-none")
    }
  }

  // Función para cargar odontólogos
  async function loadOdontologos() {
    try {
      const response = await fetch("/api/odontologos")
      const odontologos = await response.json()

      // Limpiar opciones anteriores
      odontologoSelect.innerHTML = '<option value="" disabled>Seleccionar odontólogo</option>'

      // Agregar cada odontólogo al select
      odontologos.forEach((odontologo) => {
        const option = document.createElement("option")
        option.value = odontologo.id
        option.textContent = `${odontologo.nombre} ${odontologo.apellido}`
        odontologoSelect.appendChild(option)
      })
    } catch (error) {
      console.error("Error al cargar odontólogos:", error)
    }
  }

  // Función para crear un nuevo odontólogo
  async function createOdontologo(odontologo) {
    try {
      const response = await fetch("/api/odontologos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(odontologo),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error desconocido")
      }

      const data = await response.json()

      // Agregar el nuevo odontólogo al select
      const option = document.createElement("option")
      option.value = data.id
      option.textContent = `${data.nombre} ${data.apellido}`
      odontologoSelect.appendChild(option)

      // Seleccionar el nuevo odontólogo
      odontologoSelect.value = data.id

      // Resetear el formulario
      odontologoForm.reset()
      odontologoForm.classList.remove("was-validated")

      // Cerrar el modal
      nuevoOdontologoModal.hide()

      // Mostrar mensaje de éxito
      alert("Odontólogo registrado exitosamente")
    } catch (error) {
      console.error("Error al crear odontólogo:", error)
      alert("Error al registrar odontólogo: " + error.message)
    }
  }

  // Función para actualizar la consulta
  async function updateConsulta(id, consulta) {
    try {
      const response = await fetch(`/api/consultas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consulta),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error desconocido")
      }

      alert("Consulta actualizada exitosamente")
      window.location.href = `/consultas-odontologicas/${id}`
    } catch (error) {
      console.error("Error al actualizar consulta:", error)
      alert("Error al actualizar consulta: " + error.message)
    }
  }

  // Función para inicializar el odontodiagrama
  function initOdontodiagrama(odontodiagrama) {
    // Inicializar el odontodiagrama global
    window.odontodiagrama = odontodiagrama

    // Actualizar el input hidden
    document.getElementById("odontodiagrama").value = JSON.stringify(odontodiagrama)

    // Para cada sector en el odontodiagrama
    for (const sectorKey in odontodiagrama) {
      const sectorContainer = document.querySelector(`.dientes-container[data-sector="${sectorKey}"]`)
      if (!sectorContainer) continue

      // Limpiar el contenedor
      sectorContainer.innerHTML = ""

      // Obtener los dientes para este sector
      const dientes = odontodiagrama[sectorKey].dientes

      // Ordenar los dientes según el sector
      const sortedDientes = Object.keys(dientes).sort((a, b) => {
        if (sectorKey === "1" || sectorKey === "4") {
          return Number.parseInt(b) - Number.parseInt(a) // Descendente para sectores derechos
        } else {
          return Number.parseInt(a) - Number.parseInt(b) // Ascendente para sectores izquierdos
        }
      })

      // Agregar cada diente al contenedor
      sortedDientes.forEach((dienteKey) => {
        const diente = createDienteElement(sectorKey, dienteKey, dientes[dienteKey])
        sectorContainer.appendChild(diente)
      })

      // Agregar botón "Agregar Diente"
      const addButton = document.createElement("button")
      addButton.className = "btn btn-sm btn-outline-primary btn-agregar-diente"
      addButton.innerHTML = '<i class="bi bi-plus-lg"></i> Agregar'
      addButton.addEventListener("click", () => {
        agregarDiente(sectorKey)
      })
      sectorContainer.appendChild(addButton)
    }

    // Configurar los botones de estado
    const estadoBtns = document.querySelectorAll(".estado-btn")
    estadoBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        window.valorSeleccionado = Number.parseInt(this.dataset.value)
        estadoBtns.forEach((b) => b.classList.remove("active"))
        this.classList.add("active")
      })
    })

    // Establecer el primer botón de estado como activo
    estadoBtns[1].classList.add("active")
    window.valorSeleccionado = 1
  }

  // Función para crear un elemento de diente
  function createDienteElement(sectorKey, dienteKey, dienteData) {
    const dienteContainer = document.createElement("div")
    dienteContainer.className = "diente"
    dienteContainer.dataset.sector = sectorKey
    dienteContainer.dataset.diente = dienteKey

    // Agregar número de diente
    const dienteNumero = document.createElement("div")
    dienteNumero.className = "diente-numero"
    dienteNumero.textContent = dienteKey
    dienteContainer.appendChild(dienteNumero)

    // Crear SVG para el diente
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("class", "diente-svg")
    svg.setAttribute("viewBox", "0 0 50 50")

    // Agregar círculo de referencia (opcional)
    const circle = document.createElementNS(svgNS, "circle")
    circle.setAttribute("cx", "25")
    circle.setAttribute("cy", "25")
    circle.setAttribute("r", "24")
    circle.setAttribute("class", "stroke-gray-300 fill-none")
    circle.setAttribute("stroke-width", "0.5")
    svg.appendChild(circle)

    // Agregar cada segmento
    for (const segmentoKey in dienteData.segmentos) {
      const valor = dienteData.segmentos[segmentoKey]
      const path = document.createElementNS(svgNS, "path")
      path.setAttribute("d", getSegmentPath(Number.parseInt(segmentoKey)))
      path.setAttribute("class", `segmento segmento-${valor}`)
      path.dataset.sector = sectorKey
      path.dataset.diente = dienteKey
      path.dataset.segmento = segmentoKey

      // Agregar evento de clic para cambiar el valor del segmento
      path.addEventListener("click", () => {
        cambiarSegmento(sectorKey, dienteKey, segmentoKey)
      })

      svg.appendChild(path)
    }

    dienteContainer.appendChild(svg)

    // Agregar botón de eliminar
    const deleteButton = document.createElement("div")
    deleteButton.className = "btn-eliminar-diente"
    deleteButton.innerHTML = "×"
    deleteButton.addEventListener("click", () => {
      eliminarDiente(sectorKey, dienteKey)
    })
    dienteContainer.appendChild(deleteButton)

    return dienteContainer
  }

  // Función para cambiar el valor de un segmento
  function cambiarSegmento(sectorKey, dienteKey, segmentoKey) {
    // Actualizar el valor en el objeto odontodiagrama
    window.odontodiagrama[sectorKey].dientes[dienteKey].segmentos[segmentoKey] = window.valorSeleccionado

    // Actualizar el input hidden
    document.getElementById("odontodiagrama").value = JSON.stringify(window.odontodiagrama)

    // Actualizar la UI
    const segmento = document.querySelector(
      `.segmento[data-sector="${sectorKey}"][data-diente="${dienteKey}"][data-segmento="${segmentoKey}"]`,
    )
    if (segmento) {
      segmento.classList.remove("segmento-0", "segmento-1", "segmento-2")
      segmento.classList.add(`segmento-${window.valorSeleccionado}`)
    }
  }

  // Función para agregar un nuevo diente
  function agregarDiente(sectorKey) {
    // Obtener los dientes actuales del sector
    const dientes = window.odontodiagrama[sectorKey].dientes

    // Encontrar el siguiente número disponible para el diente
    let siguienteNumero
    const dienteNums = Object.keys(dientes).map(Number)

    if (sectorKey === "1") {
      siguienteNumero = Math.max(...dienteNums) + 1
    } else if (sectorKey === "2") {
      siguienteNumero = Math.max(...dienteNums) + 1
    } else if (sectorKey === "3") {
      siguienteNumero = Math.max(...dienteNums) + 1
    } else {
      siguienteNumero = Math.max(...dienteNums) + 1
    }

    // Agregar el nuevo diente al objeto odontodiagrama
    dientes[siguienteNumero] = {
      segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    }

    // Actualizar el input hidden
    document.getElementById("odontodiagrama").value = JSON.stringify(window.odontodiagrama)

    // Reinicializar el odontodiagrama en la UI
    initOdontodiagrama(window.odontodiagrama)
  }

  // Función para eliminar un diente
  function eliminarDiente(sectorKey, dienteKey) {
    // Eliminar el diente del objeto odontodiagrama
    delete window.odontodiagrama[sectorKey].dientes[dienteKey]

    // Actualizar el input hidden
    document.getElementById("odontodiagrama").value = JSON.stringify(window.odontodiagrama)

    // Reinicializar el odontodiagrama en la UI
    initOdontodiagrama(window.odontodiagrama)
  }

  // Función para obtener el path SVG para un segmento
  function getSegmentPath(segmento) {
    const width = 50
    const height = 50
    const centerX = width / 2
    const centerY = height / 2
    const innerRadius = 8 // Radio del círculo interno
    const outerRadius = 20 // Radio del círculo externo
    const extendedRadius = 30 // Radio para los segmentos extendidos

    switch (segmento) {
      case 1: // Centro (círculo pequeño)
        return `M ${centerX} ${centerY} m -${innerRadius},0 a ${innerRadius},${innerRadius} 0 1,0 ${innerRadius * 2},0 a ${innerRadius},${innerRadius} 0 1,0 -${innerRadius * 2},0`

      case 2: // Segmento superior (90° en la parte superior del anillo)
        return `M ${centerX} ${centerY - innerRadius} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX + innerRadius} ${centerY} 
                L ${centerX + outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX} ${centerY - outerRadius} 
                Z`

      case 3: // Segmento derecho (90° en la parte derecha del anillo)
        return `M ${centerX + innerRadius} ${centerY} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX} ${centerY + innerRadius} 
                L ${centerX} ${centerY + outerRadius} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX + outerRadius} ${centerY} 
                Z`

      case 4: // Segmento inferior (90° en la parte inferior del anillo)
        return `M ${centerX} ${centerY + innerRadius} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX - innerRadius} ${centerY} 
                L ${centerX - outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX} ${centerY + outerRadius} 
                Z`

      case 5: // Segmento izquierdo (90° en la parte izquierda del anillo)
        return `M ${centerX - innerRadius} ${centerY} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX} ${centerY - innerRadius} 
                L ${centerX} ${centerY - outerRadius} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX - outerRadius} ${centerY} 
                Z`

      case 6: // Segmento extendido superior
        return `M ${centerX} ${centerY - outerRadius} 
                A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius} ${centerY} 
                L ${centerX + extendedRadius * 0.7071} ${centerY - extendedRadius * 0.7071} 
                A ${extendedRadius} ${extendedRadius} 0 0 0 ${centerX - extendedRadius * 0.7071} ${centerY - extendedRadius * 0.7071} 
                L ${centerX - outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 1 ${centerX} ${centerY - outerRadius} 
                Z`

      case 7: // Segmento extendido inferior
        return `M ${centerX} ${centerY + outerRadius} 
                A ${outerRadius} ${outerRadius} 0 0 1 ${centerX - outerRadius} ${centerY} 
                L ${centerX - extendedRadius * 0.7071} ${centerY + extendedRadius * 0.7071} 
                A ${extendedRadius} ${extendedRadius} 0 0 0 ${centerX + extendedRadius * 0.7071} ${centerY + extendedRadius * 0.7071} 
                L ${centerX + outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 1 ${centerX} ${centerY + outerRadius} 
                Z`

      default:
        return ""
    }
  }
})
