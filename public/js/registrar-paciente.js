document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("patient-form")
  const cedulaInput = document.getElementById("cedula")
  const cedulaFeedback = document.getElementById("cedula-feedback")
  const tipoCedulaRadios = document.querySelectorAll('input[name="tipo_cedula"]')
  const estadoSelect = document.getElementById("estado")
  const ciudadSelect = document.getElementById("ciudad")
  const municipioSelect = document.getElementById("municipio")

  // Load estados on page load
  loadEstados()

  // Validate cedula based on tipo_cedula
  tipoCedulaRadios.forEach((radio) => {
    radio.addEventListener("change", validateCedula)
  })

  cedulaInput.addEventListener("input", validateCedula)

  // Estado change event
  estadoSelect.addEventListener("change", function () {
    const estadoId = this.value
    if (estadoId) {
      loadCiudades(estadoId)
      ciudadSelect.disabled = false
      municipioSelect.disabled = true
      municipioSelect.innerHTML = '<option value="" selected disabled>Seleccione una ciudad primero</option>'
    } else {
      ciudadSelect.disabled = true
      municipioSelect.disabled = true
    }
  })

  // Ciudad change event
  ciudadSelect.addEventListener("change", function () {
    const ciudadId = this.value
    if (ciudadId) {
      loadMunicipios(ciudadId)
      municipioSelect.disabled = false
    } else {
      municipioSelect.disabled = true
    }
  })

  // Form submit event
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!form.checkValidity()) {
      e.stopPropagation()
      form.classList.add("was-validated")
      return
    }

    // Check cedula validation
    if (!validateCedula()) {
      return
    }

    // Get form data
    const formData = new FormData(form)
    const paciente = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      tipo_cedula: formData.get("tipo_cedula"),
      cedula: formData.get("cedula"),
      genero: formData.get("genero"),
      fecha_nacimiento: formData.get("fecha_nacimiento"),
      estado: estadoSelect.options[estadoSelect.selectedIndex].text,
      ciudad: ciudadSelect.options[ciudadSelect.selectedIndex].text,
      municipio: municipioSelect.options[municipioSelect.selectedIndex].text,
      direccion: formData.get("direccion"),
      telefono: formData.get("telefono"),
      email: formData.get("email") || null,
    }

    // Submit data
    submitPatient(paciente)
  })

  // Function to validate cedula
  function validateCedula() {
    const tipoCedula = document.querySelector('input[name="tipo_cedula"]:checked').value
    const cedula = cedulaInput.value.trim()

    if (!cedula) {
      cedulaFeedback.textContent = "Por favor ingrese la cédula."
      cedulaInput.setCustomValidity("Por favor ingrese la cédula.")
      return false
    }

    if (tipoCedula === "V") {
      if (cedula.length < 5 || cedula.length > 8) {
        cedulaFeedback.textContent = "La cédula venezolana debe tener entre 5 y 8 dígitos."
        cedulaInput.setCustomValidity("La cédula venezolana debe tener entre 5 y 8 dígitos.")
        return false
      }
    } else if (tipoCedula === "E") {
      if (cedula.length > 20) {
        cedulaFeedback.textContent = "La cédula extranjera no puede tener más de 20 dígitos."
        cedulaInput.setCustomValidity("La cédula extranjera no puede tener más de 20 dígitos.")
        return false
      }
    }

    cedulaInput.setCustomValidity("")
    return true
  }

  // Function to load estados
  function loadEstados() {
    fetch("/api/estados")
      .then((response) => response.json())
      .then((estados) => {
        estadoSelect.innerHTML = '<option value="" selected disabled>Seleccionar estado</option>'
        estados.forEach((estado) => {
          const option = document.createElement("option")
          option.value = estado.id
          option.textContent = estado.nombre
          estadoSelect.appendChild(option)
        })
      })
      .catch((error) => {
        console.error("Error loading estados:", error)
      })
  }

  // Function to load ciudades
  function loadCiudades(estadoId) {
    fetch(`/api/ciudades/${estadoId}`)
      .then((response) => response.json())
      .then((ciudades) => {
        ciudadSelect.innerHTML = '<option value="" selected disabled>Seleccionar ciudad</option>'
        ciudades.forEach((ciudad) => {
          const option = document.createElement("option")
          option.value = ciudad.id
          option.textContent = ciudad.nombre
          ciudadSelect.appendChild(option)
        })
      })
      .catch((error) => {
        console.error("Error loading ciudades:", error)
      })
  }

  // Function to load municipios
  function loadMunicipios(ciudadId) {
    fetch(`/api/municipios/${ciudadId}`)
      .then((response) => response.json())
      .then((municipios) => {
        municipioSelect.innerHTML = '<option value="" selected disabled>Seleccionar municipio</option>'
        municipios.forEach((municipio) => {
          const option = document.createElement("option")
          option.value = municipio.id
          option.textContent = municipio.nombre
          municipioSelect.appendChild(option)
        })
      })
      .catch((error) => {
        console.error("Error loading municipios:", error)
      })
  }

  // Function to submit patient data
  function submitPatient(paciente) {
    fetch("/api/pacientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paciente),
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
        alert("Paciente registrado exitosamente")
        window.location.href = "/pacientes"
      })
      .catch((error) => {
        console.error("Error registering patient:", error)
        alert("Error al registrar paciente: " + (error.error || "Error desconocido"))
      })
  }
})
