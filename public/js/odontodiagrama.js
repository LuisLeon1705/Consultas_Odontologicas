document.addEventListener("DOMContentLoaded", () => {
  // Initial odontodiagrama data structure
  const odontodiagrama = {
    // Superior izquierdo (cuadrante 2)
    2: {
      dientes: {
        21: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        22: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        23: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        24: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        25: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        26: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        27: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        28: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
      },
    },
    // Superior derecho (cuadrante 1)
    1: {
      dientes: {
        11: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        12: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        13: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        14: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        15: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        16: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        17: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        18: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
      },
    },
    // Inferior izquierdo (cuadrante 3)
    3: {
      dientes: {
        31: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        32: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        33: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        34: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        35: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        36: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        37: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        38: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
      },
    },
    // Inferior derecho (cuadrante 4)
    4: {
      dientes: {
        41: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        42: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        43: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        44: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        45: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        46: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        47: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
        48: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
      },
    },
  }

  // Current selected value (0: white, 1: blue, 2: red)
  let valorSeleccionado = 1

  // Initialize the odontodiagrama
  initOdontodiagrama()

  // Set up event listeners for estado buttons
  const estadoBtns = document.querySelectorAll(".estado-btn")
  estadoBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      valorSeleccionado = Number.parseInt(this.dataset.value)
      estadoBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
    })
  })

  // Set the first estado button as active
  estadoBtns[1].classList.add("active")

  // Initialize the hidden input with the odontodiagrama data
  document.getElementById("odontodiagrama").value = JSON.stringify(odontodiagrama)

  // Function to initialize the odontodiagrama
  function initOdontodiagrama() {
    // For each sector
    for (const sectorKey in odontodiagrama) {
      const sectorContainer = document.querySelector(`.dientes-container[data-sector="${sectorKey}"]`)
      if (!sectorContainer) continue

      // Clear the container
      sectorContainer.innerHTML = ""

      // Get the dientes for this sector
      const dientes = odontodiagrama[sectorKey].dientes

      // Sort the dientes based on the sector
      const sortedDientes = Object.keys(dientes).sort((a, b) => {
        if (sectorKey === "1" || sectorKey === "4") {
          return Number.parseInt(b) - Number.parseInt(a) // Descending for right sectors
        } else {
          return Number.parseInt(a) - Number.parseInt(b) // Ascending for left sectors
        }
      })

      // Add each diente to the container
      sortedDientes.forEach((dienteKey) => {
        const diente = createDienteElement(sectorKey, dienteKey, dientes[dienteKey])
        sectorContainer.appendChild(diente)
      })

      // Add "Add Tooth" button
      const addButton = document.createElement("button")
      addButton.className = "btn btn-sm btn-outline-primary btn-agregar-diente"
      addButton.innerHTML = '<i class="bi bi-plus-lg"></i> Agregar'
      addButton.addEventListener("click", () => {
        agregarDiente(sectorKey)
      })
      sectorContainer.appendChild(addButton)
    }
  }

  // Function to create a diente element
  function createDienteElement(sectorKey, dienteKey, dienteData) {
    const dienteContainer = document.createElement("div")
    dienteContainer.className = "diente"
    dienteContainer.dataset.sector = sectorKey
    dienteContainer.dataset.diente = dienteKey

    // Add diente number
    const dienteNumero = document.createElement("div")
    dienteNumero.className = "diente-numero"
    dienteNumero.textContent = dienteKey
    dienteContainer.appendChild(dienteNumero)

    // Create SVG for the diente
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("class", "diente-svg")
    svg.setAttribute("viewBox", "0 0 50 50")

    // Add reference circle (optional)
    const circle = document.createElementNS(svgNS, "circle")
    circle.setAttribute("cx", "25")
    circle.setAttribute("cy", "25")
    circle.setAttribute("r", "24")
    circle.setAttribute("class", "stroke-gray-300 fill-none")
    circle.setAttribute("stroke-width", "0.5")
    svg.appendChild(circle)

    // Add each segment
    for (const segmentoKey in dienteData.segmentos) {
      const valor = dienteData.segmentos[segmentoKey]
      const path = document.createElementNS(svgNS, "path")
      path.setAttribute("d", getSegmentPath(Number.parseInt(segmentoKey)))
      path.setAttribute("class", `segmento segmento-${valor}`)
      path.dataset.sector = sectorKey
      path.dataset.diente = dienteKey
      path.dataset.segmento = segmentoKey

      // Add click event to change segment value
      path.addEventListener("click", () => {
        cambiarSegmento(sectorKey, dienteKey, segmentoKey)
      })

      svg.appendChild(path)
    }

    dienteContainer.appendChild(svg)

    // Add delete button
    const deleteButton = document.createElement("div")
    deleteButton.className = "btn-eliminar-diente"
    deleteButton.innerHTML = "×"
    deleteButton.addEventListener("click", () => {
      eliminarDiente(sectorKey, dienteKey)
    })
    dienteContainer.appendChild(deleteButton)

    return dienteContainer
  }

  // Function to get the SVG path for a segment
  function getSegmentPath(segmento) {
    const width = 50
    const height = 50
    const centerX = width / 2
    const centerY = height / 2
    const innerRadius = 8 // Inner circle radius
    const outerRadius = 20 // Outer circle radius
    const extendedRadius = 30 // Extended segments radius

    switch (segmento) {
      case 1: // Center (small circle)
        return `M ${centerX} ${centerY} m -${innerRadius},0 a ${innerRadius},${innerRadius} 0 1,0 ${innerRadius * 2},0 a ${innerRadius},${innerRadius} 0 1,0 -${innerRadius * 2},0`

      case 2: // Top segment (90° at the top of the ring)
        return `M ${centerX} ${centerY - innerRadius} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX + innerRadius} ${centerY} 
                L ${centerX + outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX} ${centerY - outerRadius} 
                Z`

      case 3: // Right segment (90° at the right of the ring)
        return `M ${centerX + innerRadius} ${centerY} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX} ${centerY + innerRadius} 
                L ${centerX} ${centerY + outerRadius} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX + outerRadius} ${centerY} 
                Z`

      case 4: // Bottom segment (90° at the bottom of the ring)
        return `M ${centerX} ${centerY + innerRadius} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX - innerRadius} ${centerY} 
                L ${centerX - outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX} ${centerY + outerRadius} 
                Z`

      case 5: // Left segment (90° at the left of the ring)
        return `M ${centerX - innerRadius} ${centerY} 
                A ${innerRadius} ${innerRadius} 0 0 1 ${centerX} ${centerY - innerRadius} 
                L ${centerX} ${centerY - outerRadius} 
                A ${outerRadius} ${outerRadius} 0 0 0 ${centerX - outerRadius} ${centerY} 
                Z`

      case 6: // Extended top segment
        return `M ${centerX} ${centerY - outerRadius} 
                A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius} ${centerY} 
                L ${centerX + extendedRadius * 0.7071} ${centerY - extendedRadius * 0.7071} 
                A ${extendedRadius} ${extendedRadius} 0 0 0 ${centerX - extendedRadius * 0.7071} ${centerY - extendedRadius * 0.7071} 
                L ${centerX - outerRadius} ${centerY} 
                A ${outerRadius} ${outerRadius} 0 0 1 ${centerX} ${centerY - outerRadius} 
                Z`

      case 7: // Extended bottom segment
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

  // Function to change a segment value
  function cambiarSegmento(sectorKey, dienteKey, segmentoKey) {
    // Update the data structure
    odontodiagrama[sectorKey].dientes[dienteKey].segmentos[segmentoKey] = valorSeleccionado

    // Update the UI
    const segmento = document.querySelector(
      `.segmento[data-sector="${sectorKey}"][data-diente="${dienteKey}"][data-segmento="${segmentoKey}"]`,
    )
    if (segmento) {
      segmento.classList.remove("segmento-0", "segmento-1", "segmento-2")
      segmento.classList.add(`segmento-${valorSeleccionado}`)
    }

    // Update the hidden input
    document.getElementById("odontodiagrama").value = JSON.stringify(odontodiagrama)
  }

  // Function to add a new tooth
  function agregarDiente(sectorKey) {
    const dientes = odontodiagrama[sectorKey].dientes

    // Find the next available number for the tooth
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

    // Add the new tooth to the data structure
    dientes[siguienteNumero] = {
      segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    }

    // Update the UI
    initOdontodiagrama()

    // Update the hidden input
    document.getElementById("odontodiagrama").value = JSON.stringify(odontodiagrama)
  }

  // Function to delete a tooth
  function eliminarDiente(sectorKey, dienteKey) {
    // Remove the tooth from the data structure
    delete odontodiagrama[sectorKey].dientes[dienteKey]

    // Update the UI
    initOdontodiagrama()

    // Update the hidden input
    document.getElementById("odontodiagrama").value = JSON.stringify(odontodiagrama)
  }
})
