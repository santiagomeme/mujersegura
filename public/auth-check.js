// Asegurarse de que Firebase y Auth están disponibles
if (typeof firebase !== "undefined") {
  const auth = firebase.auth();

  auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split("/").pop();

    // ✅ Si el usuario NO está autenticado
    if (!user) {
      // Páginas que requieren login
      const paginasProtegidas = ["script.html","blog.html", "reportes.html"];

      if (paginasProtegidas.includes(currentPage)) {
        // Si intenta acceder a una página protegida sin estar logueado, enviarlo al login
        window.location.href = "login.html";
      }

      // ⚠️ En login o registro, no hacer nada (permitir acceso)
      return;
    }

    // ✅ Si el usuario SÍ está autenticado
    if (user) {
      // Si está en login o registro, redirigir al formulario
      if (currentPage === "login.html" || currentPage === "registro.html") {
        window.location.href = "script.html";
      }
    }
  });
} else {
  console.error("❌ Firebase no está cargado antes de auth-check.js");
}
