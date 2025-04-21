document.addEventListener("DOMContentLoaded", () => {
  // Verificar la conexión a la base de datos
  fetch("/api/db-check")
    .then((response) => response.json())
    .then((data) => {
      if (data.connected) {
        console.log("Conexión a la base de datos establecida correctamente")
      } else {
        console.error("Error en la conexión a la base de datos:", data.error)
        alert("Error en la conexión a la base de datos. Verifique la configuración.")
      }
    })
    .catch((error) => {
      console.error("Error al verificar la conexión a la base de datos:", error)
    })
})
