document.addEventListener("DOMContentLoaded", () => {
  const patientsTableBody = document.getElementById("patients-table-body")
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  const loadingIndicator = document.getElementById("loading-indicator")
  const noResults = document.getElementById("no-results")
  const patientsTable = document.getElementById("patients-table")

  // Load patients on page load
  loadPatients()

  // Search button click event
  searchButton.addEventListener("click", () => {
    searchPatients(searchInput.value)
  })

  // Search on Enter key
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchPatients(searchInput.value)
    }
  })

  // Function to load all patients
  function loadPatients() {
    showLoading(true)

    fetch("/api/pacientes")
      .then((response) => response.json())
      .then((patients) => {
        renderPatients(patients)
      })
      .catch((error) => {
        console.error("Error loading patients:", error)
        showNoResults(true)
      })
      .finally(() => {
        showLoading(false)
      })
  }

  // Function to search patients
  function searchPatients(query) {
    if (!query.trim()) {
      loadPatients()
      return
    }

    showLoading(true)

    fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((patients) => {
        renderPatients(patients)
      })
      .catch((error) => {
        console.error("Error searching patients:", error)
        showNoResults(true)
      })
      .finally(() => {
        showLoading(false)
      })
  }

  // Function to render patients in the table
  function renderPatients(patients) {
    patientsTableBody.innerHTML = ""

    if (patients.length === 0) {
      showNoResults(true)
      return
    }

    showNoResults(false)

    patients.forEach((patient) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${patient.id}</td>
        <td>${patient.nombre}</td>
        <td>${patient.apellido}</td>
        <td>${patient.tipo_cedula}-${patient.cedula}</td>
        <td>${patient.telefono || "-"}</td>
        <td>${patient.email || "-"}</td>
        <td>
          <div class="btn-group" role="group">
            <a href="/pacientes/${patient.id}" class="btn btn-sm btn-outline-primary">Ver</a>
            <a href="/pacientes/${patient.id}/editar" class="btn btn-sm btn-outline-primary">Editar</a>
            <a href="/consultas-odontologicas/nueva?paciente=${patient.id}" class="btn btn-sm btn-outline-primary">Nueva Consulta</a>
          </div>
        </td>
      `
      patientsTableBody.appendChild(row)
    })
  }

  // Helper functions to show/hide elements
  function showLoading(show) {
    loadingIndicator.classList.toggle("d-none", !show)
    patientsTable.classList.toggle("d-none", show)
  }

  function showNoResults(show) {
    noResults.classList.toggle("d-none", !show)
    patientsTable.classList.toggle("d-none", show)
  }
})
