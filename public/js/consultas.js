document.addEventListener("DOMContentLoaded", () => {
  const consultationsTableBody = document.getElementById("consultations-table-body")
  const searchInput = document.getElementById("search-input")
  const loadingIndicator = document.getElementById("loading-indicator")
  const noResults = document.getElementById("no-results")
  const consultationsTable = document.getElementById("consultations-table")

  // Load consultations on page load
  loadConsultations()

  // Search input event
  searchInput.addEventListener("input", function () {
    filterConsultations(this.value)
  })

  // Function to load all consultations
  function loadConsultations() {
    showLoading(true)

    fetch("/api/consultas")
      .then((response) => response.json())
      .then((consultations) => {
        // Store consultations in a global variable for filtering
        window.allConsultations = consultations
        renderConsultations(consultations)
      })
      .catch((error) => {
        console.error("Error loading consultations:", error)
        showNoResults(true)
      })
      .finally(() => {
        showLoading(false)
      })
  }

  // Function to filter consultations client-side
  function filterConsultations(query) {
    if (!window.allConsultations) return

    if (!query.trim()) {
      renderConsultations(window.allConsultations)
      return
    }

    query = query.toLowerCase()
    const filtered = window.allConsultations.filter(
      (consultation) =>
        consultation.paciente.toLowerCase().includes(query) ||
        consultation.motivo.toLowerCase().includes(query) ||
        consultation.fecha.includes(query),
    )

    renderConsultations(filtered)
  }

  // Function to render consultations in the table
  function renderConsultations(consultations) {
    consultationsTableBody.innerHTML = ""

    if (consultations.length === 0) {
      showNoResults(true)
      return
    }

    showNoResults(false)

    consultations.forEach((consultation) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${consultation.id}</td>
        <td>${consultation.paciente}</td>
        <td>${formatDate(consultation.fecha)}</td>
        <td>${consultation.motivo}</td>
        <td>${consultation.odontologo || "No asignado"}</td>
        <td>
          <div class="btn-group" role="group">
            <a href="/consultas-odontologicas/${consultation.id}" class="btn btn-sm btn-outline-primary">Ver</a>
            <a href="/consultas-odontologicas/${consultation.id}/editar" class="btn btn-sm btn-outline-primary">Editar</a>
          </div>
        </td>
      `
      consultationsTableBody.appendChild(row)
    })
  }

  // Helper function to format date
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

  // Helper functions to show/hide elements
  function showLoading(show) {
    loadingIndicator.classList.toggle("d-none", !show)
    consultationsTable.classList.toggle("d-none", show)
  }

  function showNoResults(show) {
    noResults.classList.toggle("d-none", !show)
    consultationsTable.classList.toggle("d-none", show)
  }
})
