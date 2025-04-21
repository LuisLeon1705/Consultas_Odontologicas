// Main JavaScript file for the dashboard
document.addEventListener("DOMContentLoaded", () => {
  // Mobile sidebar toggle
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.querySelector("#sidebar").classList.toggle("show")
    })
  }
})
