document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("consultation-form")
  const patientSearch = document.getElementById("patient-search")
  const searchPatientBtn = document.getElementById("search-patient-btn")
  const searchResults = document.getElementById("search-results")
  const searchResultsBody = document.getElementById("search-results-body")
  const noPatientsFound = document.getElementById("no-patients-found")
  const selectedPatient = document.getElementById("selected-patient")
  const patientName = document.getElementById("patient-name")
  const patientCedula = document.getElementById("patient-cedula")
  const pacienteIdInput = document.getElementById("paciente_id")
  const odontologoSelect = document.getElementById("odontologo-select")
  const odontologoForm = document.getElementById("odontologo-form")
  const guardarOdontologoBtn = document.getElementById("guardar-odontologo-btn")
  const nuevoOdontologoModal = new bootstrap.Modal(document.getElementById("nuevoOdontologoModal"))

  // Check if there's a patient ID in the URL
  const urlParams = new URLSearchParams(window.location.search)
  const patientId = urlParams.get("paciente")
  if (patientId) {
    loadPatient(patientId)
  }

  // Load odontólogos on page load
  loadOdontologos()

  // Search button click event
  searchPatientBtn.addEventListener("click", () => {
    searchPatients(patientSearch.value)
  })

  // Search on Enter key
  patientSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchPatients(patientSearch.value)
      e.preventDefault()
    }
  })

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

    // Check if a patient is selected
    if (!pacienteIdInput.value) {
      alert("Debe seleccionar un paciente")
      return
    }

    // Check if an odontólogo is selected
    if (!odontologoSelect.value) {
      alert("Debe seleccionar un odontólogo")
      return
    }

    // Get form data
    const formData = new FormData(form)

    // Add odontodiagrama data
    const odontodiagrama = document.getElementById("odontodiagrama").value

    // Create consultation object
    const consulta = {
      paciente_id: Number.parseInt(formData.get("paciente_id")),
      odontologo_id: Number.parseInt(formData.get("odontologo_id")),
      motivo: formData.get("motivo"),
      odontodiagrama: JSON.parse(odontodiagrama),
    }

    // Submit data
    submitConsultation(consulta)
  })

  // Function to search patients
  function searchPatients(query) {
    if (!query.trim()) {
      return
    }

    fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((patients) => {
        if (patients.length === 0) {
          showNoResults(true)
          return
        }

        showNoResults(false)
        showSearchResults(true)

        // Clear previous results
        searchResultsBody.innerHTML = ""

        // Add each patient to the results
        patients.forEach((patient) => {
          const row = document.createElement("tr")
          row.innerHTML = `
            <td>${patient.nombre}</td>
            <td>${patient.apellido}</td>
            <td>${patient.tipo_cedula}-${patient.cedula}</td>
            <td>
              <button type="button" class="btn btn-sm btn-outline-primary select-patient" data-id="${patient.id}">
                Seleccionar
              </button>
            </td>
          `
          searchResultsBody.appendChild(row)
        })

        // Add event listeners to select buttons
        document.querySelectorAll(".select-patient").forEach((button) => {
          button.addEventListener("click", function () {
            const patientId = this.dataset.id
            selectPatient(patients.find((p) => p.id == patientId))
          })
        })
      })
      .catch((error) => {
        console.error("Error searching patients:", error)
        alert("Error al buscar pacientes")
      })
  }

  // Function to load a patient by ID
  function loadPatient(id) {
    fetch(`/api/pacientes/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Patient not found")
        }
        return response.json()
      })
      .then((patient) => {
        selectPatient(patient)
      })
      .catch((error) => {
        console.error("Error loading patient:", error)
      })
  }

  // Function to load odontólogos
  function loadOdontologos() {
    fetch("/api/odontologos")
      .then((response) => response.json())
      .then((odontologos) => {
        // Clear previous options
        odontologoSelect.innerHTML = '<option value="" selected disabled>Seleccionar odontólogo</option>'

        // Add each odontólogo to the select
        odontologos.forEach((odontologo) => {
          const option = document.createElement("option")
          option.value = odontologo.id
          option.textContent = `${odontologo.nombre} ${odontologo.apellido}`
          odontologoSelect.appendChild(option)
        })
      })
      .catch((error) => {
        console.error("Error loading odontólogos:", error)
      })
  }

  // Function to create a new odontólogo
  function createOdontologo(odontologo) {
    fetch("/api/odontologos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(odontologo),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw err
          })
        }
        return response.json()
      })
      .then((data) => {
        // Add the new odontólogo to the select
        const option = document.createElement("option")
        option.value = data.id
        option.textContent = `${data.nombre} ${data.apellido}`
        odontologoSelect.appendChild(option)

        // Select the new odontólogo
        odontologoSelect.value = data.id

        // Reset the form
        odontologoForm.reset()
        odontologoForm.classList.remove("was-validated")

        // Close the modal
        nuevoOdontologoModal.hide()

        // Show success message
        alert("Odontólogo registrado exitosamente")
      })
      .catch((error) => {
        console.error("Error creating odontólogo:", error)
        alert("Error al registrar odontólogo: " + (error.error || "Error desconocido"))
      })
  }

  // Function to select a patient
  function selectPatient(patient) {
    // Update the hidden input
    pacienteIdInput.value = patient.id

    // Update the selected patient display
    patientName.textContent = `Nombre: ${patient.nombre} ${patient.apellido}`
    patientCedula.textContent = `Cédula: ${patient.tipo_cedula}-${patient.cedula}`

    // Show the selected patient section
    showSelectedPatient(true)

    // Hide the search results
    showSearchResults(false)
  }

  // Function to submit consultation data
  function submitConsultation(consulta) {
    fetch("/api/consultas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(consulta),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw err
          })
        }
        return response.json()
      })
      .then((data) => {
        alert("Consulta registrada exitosamente")
        window.location.href = "/consultas-odontologicas"
      })
      .catch((error) => {
        console.error("Error registering consultation:", error)
        alert("Error al registrar consulta: " + (error.error || "Error desconocido"))
      })
  }

  // Helper functions to show/hide elements
  function showSearchResults(show) {
    searchResults.classList.toggle("d-none", !show)
  }

  function showNoResults(show) {
    noPatientsFound.classList.toggle("d-none", !show)
    searchResults.classList.toggle("d-none", show)
  }

  function showSelectedPatient(show) {
    selectedPatient.classList.toggle("d-none", !show)
  }
})
