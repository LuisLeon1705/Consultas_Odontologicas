document.addEventListener("DOMContentLoaded", () => {
  const loadingIndicator = document.getElementById("loading-indicator")
  const errorMessage = document.getElementById("error-message")
  const consultaContainer = document.getElementById("consulta-container")
  const pageTitle = document.getElementById("page-title")
  const editLink = document.getElementById("edit-link")

  // Elementos para mostrar la información de la consulta
  const pacienteNombre = document.getElementById("paciente-nombre")
  const pacienteCedula = document.getElementById("paciente-cedula")
  const fechaConsulta = document.getElementById("fecha-consulta")
  const odontologoNombre = document.getElementById("odontologo-nombre")
  const motivoConsulta = document.getElementById("motivo-consulta")

  // Obtener el ID de la consulta de la URL
  const consultaId = window.location.pathname.split("/").pop()

  // Actualizar el enlace de edición
  editLink.href = `/consultas-odontologicas/${consultaId}/editar`

  // Cargar los datos de la consulta
  loadConsulta(consultaId)

  // Función para cargar los datos de la consulta
  async function loadConsulta(id) {
    try {
      const response = await fetch(`/api/consultas/${id}`)

      if (!response.ok) {
        throw new Error("Error al cargar la consulta")
      }

      const consulta = await response.json()

      // Actualizar el título de la página
      pageTitle.textContent = `Consulta #${consulta.id}`

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

      // Mostrar la información del odontólogo
      odontologoNombre.textContent = consulta.odontologo || "No asignado"

      // Mostrar el motivo de la consulta
      motivoConsulta.textContent = consulta.motivo

      // Si hay odontodiagrama, mostrarlo
      if (consulta.odontodiagrama) {
        renderOdontodiagrama(consulta.odontodiagrama)
      }

      // Ocultar el indicador de carga y mostrar el contenido
      loadingIndicator.classList.add("d-none")
      consultaContainer.classList.remove("d-none")
    } catch (error) {
      console.error("Error al cargar la consulta:", error)
      loadingIndicator.classList.add("d-none")
      errorMessage.classList.remove("d-none")
    }
  }

  // Función para renderizar el odontodiagrama
  function renderOdontodiagrama(odontodiagrama) {
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
        const diente = createDienteElement(sectorKey, dienteKey, dientes[dienteKey], true) // true para modo solo lectura
        sectorContainer.appendChild(diente)
      })
    }
  }

  // Función para crear un elemento de diente (solo lectura)
  function createDienteElement(sectorKey, dienteKey, dienteData, readOnly = false) {
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

      svg.appendChild(path)
    }

    dienteContainer.appendChild(svg)

    return dienteContainer
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
