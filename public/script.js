document.addEventListener("DOMContentLoaded", () => {
  
  const form = document.getElementById("reporteForm");
  const provider = new window.GeoSearch.OpenStreetMapProvider();

  if (!form) return;

  // === Inicializar mapa ===
  const map = L.map("map", { zoomControl: true }).setView([3.4516, -76.5320], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // === Variables globales ===
  let isLocked = true;
  let marker = null;
  let lat = null;
  let lng = null;
  let ciudad = null;

  // === Capa de bloqueo ===
  const overlay = document.createElement("div");
  overlay.id = "map-overlay";
  Object.assign(overlay.style, {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 0, 0, 0.25)",
    zIndex: 400,
    pointerEvents: "auto",
  });
  document.getElementById("map").appendChild(overlay);

  function bloquearMapa() {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    overlay.style.pointerEvents = "auto";
  }
  function desbloquearMapa() {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    overlay.style.pointerEvents = "none";
  }

  // === Botón de bloqueo ===
  const LockControl = L.Control.extend({
    onAdd: function () {
      const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      const btn = L.DomUtil.create("button", "leaflet-control-lock", container);
      btn.innerHTML = "🔓 Desbloquear";
      btn.style.cssText = `
        background:#fff; color:#333; font-weight:bold; border-radius:8px;
        padding:6px 10px; width:140px; border:1px solid #aaa; cursor:pointer;
      `;
      L.DomEvent.on(btn, "click", (e) => {
        e.preventDefault();
        isLocked = !isLocked;
        if (isLocked) {
          bloquearMapa();
          overlay.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
          btn.innerHTML = "🔓 Desbloquear";
        } else {
          desbloquearMapa();
          overlay.style.backgroundColor = "transparent";
          btn.innerHTML = "🔒 Bloquear";
        }
      });
      return container;
    },
  });
  map.addControl(new LockControl({ position: "topright" }));
  bloquearMapa();

  // === Click en mapa ===
  map.on("click", (e) => {
    if (isLocked) return;
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      lat = pos.lat;
      lng = pos.lng;
    });
  });

 
  document.getElementById("buscarDireccion").addEventListener("click", async () => {
    const direccion = document.getElementById("direccion").value.trim();
    if (!direccion) {
      alert("Por favor escribe una dirección.");
      return;
    }

    try {
      const resultados = await provider.search({ query: direccion });
      if (resultados.length > 0) {
        lat = resultados[0].y;
        lng = resultados[0].x;
        ciudad = resultados[0].raw.address.city || resultados[0].raw.address.town || resultados[0].raw.address.village || "Desconocido";

        map.setView([lat, lng], 16);
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);

        marker.on("dragend", function (e) {
          const pos = e.target.getLatLng();
          lat = pos.lat;
          lng = pos.lng;
        });

        desbloquearMapa();
        alert(`📍 Dirección encontrada en ${ciudad}. Puedes ajustar el marcador.`);
      } else {
        alert("No se encontró la dirección.");
      }
    } catch (error) {
      console.error("Error buscando dirección:", error);
      alert("Error al buscar la dirección.");
    }
  });



  //===========================
// === Envío del formulario ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!lat || !lng) {
    alert("⚠️ Marca una ubicación en el mapa antes de enviar.");
    return;
  }

  try {
    // 1️⃣ Guardar el reporte en Firestore
    await db.collection("reportes").add({
      tipo,
      descripcion,
      direccion,
      fecha: fecha || "Sin fecha",
      ciudad: ciudad || "Desconocido",
      latitud: lat,
      longitud: lng,
      fechaRegistro: firebase.firestore.Timestamp.now(),
    });

    console.log("✅ Reporte guardado correctamente en Firestore.");

    // 2️⃣ Enviar una notificación a todos los tokens guardados
    await enviarNotificacionGlobal({
      title: "🚨 Nuevo reporte de maltrato",
      body: `${tipo}: ${descripcion.substring(0, 50)}...`,
    });

    // 3️⃣ Limpiar formulario e interfaz
    alert("✅ Reporte enviado correctamente.");
    form.reset();
    if (marker) map.removeLayer(marker);
    lat = lng = null;
  } catch (error) {
    console.error("❌ Error al guardar o notificar:", error);
    alert("Hubo un error al guardar el reporte o al enviar la notificación.");
  }
});

/**
 * === Función auxiliar ===
 * Envía una notificación a todos los usuarios registrados con FCM
 */
async function enviarNotificacionGlobal(mensaje) {
  try {
    // 🔹 Esta URL apunta a tu servidor local o desplegado (Node con firebase-admin)
   const response = await fetch("https://mujersegura.onrender.com/enviarNotificacion", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mensaje),
    });

    const data = await response.json();
    if (data.success) {
      console.log("📢 Notificación enviada a todos los usuarios:", data);
    } else {
      console.warn("⚠️ No se pudo enviar la notificación:", data);
    }
  } catch (err) {
    console.error("❌ Error al enviar notificación global:", err);
  }
}
});