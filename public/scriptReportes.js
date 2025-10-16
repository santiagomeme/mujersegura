auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('🔒 Usuario autenticado:', user.email);
  } else {
    window.location.href = 'login.html';
  }
});

document.addEventListener("DOMContentLoaded", async () => {



  
  const map = L.map("mapReportes").setView([3.4516, -76.5320], 13); // Cali

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 500);

  const overlay = document.getElementById("mapOverlay");
  overlay.style.display = "block";
  overlay.style.pointerEvents = "auto";
  overlay.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "400";

  let isLocked = true;

  bloquearMapa();

  function bloquearMapa() {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();

    overlay.style.pointerEvents = "auto";
    overlay.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
  }

  function desbloquearMapa() {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.touchZoom.enable();

    overlay.style.pointerEvents = "none";
    overlay.style.backgroundColor = "transparent";
  }

  function toggleLock(btn) {
    isLocked = !isLocked;
    if (isLocked) {
      bloquearMapa();
      btn.innerHTML = "🔓 Desbloquear";
    } else {
      desbloquearMapa();
      btn.innerHTML = "🔒 Bloquear";
    }
  }

  // === Control personalizado igual que en la otra página ===
  const LockControl = L.Control.extend({
    onAdd: function () {
      const btn = L.DomUtil.create("button", "leaflet-control-lock");
      btn.innerHTML = "🔓 Desbloquear";
      L.DomEvent.disableClickPropagation(btn);
      L.DomEvent.on(btn, "click", (e) => {
        e.preventDefault();
        toggleLock(btn);
      });
      return btn;
    }
  });

  map.addControl(new LockControl({ position: "topright" }));

  const listaReportes = document.getElementById("listaReportes");



  async function cargarReportes() {
    listaReportes.innerHTML = "";

    try {
const querySnapshot = await db.collection("reportes").orderBy("fechaRegistro", "desc").get();

      querySnapshot.forEach(doc => {
        const reporte = doc.data();

        const marker = L.marker([reporte.latitud, reporte.longitud]).addTo(map);
        marker.bindPopup(`
          <b>${reporte.tipo}</b><br>
          ${reporte.descripcion || "Sin descripción"}<br>
          ${reporte.direccion || ""}
        `);

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${reporte.tipo}</h3>
          <p>${reporte.descripcion || ""}</p>
          <p><i>${reporte.direccion || "Sin dirección"}</i></p>
          <p><b>Fecha:</b> ${new Date(reporte.fechaRegistro).toLocaleString()}</p>

          `;
        listaReportes.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando reportes:", error);
      listaReportes.innerHTML = "<p>Error cargando reportes.</p>";
    }
  }

  cargarReportes();
});
