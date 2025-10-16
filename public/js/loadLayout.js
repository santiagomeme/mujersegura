// 📁 public/js/loadLayout.js

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // === Insertar HEADER ===
    const headerPlaceholder = document.createElement("div");
    headerPlaceholder.id = "header-placeholder";
    document.body.prepend(headerPlaceholder);

    const headerResponse = await fetch("components/header.html");
    if (!headerResponse.ok) throw new Error("No se encontró header.html");
    const headerHTML = await headerResponse.text();
    headerPlaceholder.innerHTML = headerHTML;

    // Menú hamburguesa
    const menuToggle = document.getElementById("menuToggle");
    const menu = document.getElementById("menu");
    if (menuToggle && menu) {
      menuToggle.addEventListener("click", () => {
        menu.classList.toggle("active");
      });
    }

    // === Insertar FOOTER ===
    const footerPlaceholder = document.createElement("div");
    footerPlaceholder.id = "footer-placeholder";
    document.body.appendChild(footerPlaceholder);

    const footerResponse = await fetch("components/footer.html");
    if (!footerResponse.ok) throw new Error("No se encontró footer.html");
    const footerHTML = await footerResponse.text();
    footerPlaceholder.innerHTML = footerHTML;

  } catch (error) {
    console.error("Error cargando header/footer:", error);
  }
});
// 📁 public/js/loadLayout.js

