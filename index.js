// ===== LOGICA-INICIO =====
const HORA_MIN = 8 * 60;   // 8:00
const HORA_MAX = 19 * 60;  // 19:00

function aMinutos(texto) {
  if (typeof texto !== "string") return NaN;
  const m = /^(\d{1,2}):(\d{2})$/.exec(texto.trim());
  if (!m) return NaN;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return NaN;
  return h * 60 + min;
}

function aTexto(minutos) {
  const h = Math.floor(minutos / 60);
  const m = String(minutos % 60).padStart(2, "0");
  return h + ":" + m;
}

// Devuelve { ok: true, inicio, fin } o { ok: false, mensaje }
function validarReserva(textoInicio, textoFin, reservas) {
  if (!textoInicio || !textoFin) {
    return { ok: false, mensaje: "Completa la hora de inicio y la hora de finalización." };
  }
  const inicio = aMinutos(textoInicio);
  const fin = aMinutos(textoFin);
  if (isNaN(inicio) || isNaN(fin)) {
    return { ok: false, mensaje: "Las horas no son válidas. Usa el formato HH:MM." };
  }
  if (inicio < HORA_MIN || fin > HORA_MAX) {
    return { ok: false, mensaje: "Horario no permitido. Reserva entre las 8:00 y las 19:00." };
  }
  if (inicio >= fin) {
    return { ok: false, mensaje: "La hora de inicio debe ser anterior a la hora de finalización." };
  }
  // Se superponen si cada una empieza antes de que termine la otra.
  // Con "<" estricto, 10:00-12:00 y 12:00-14:00 son consecutivas y permitidas.
  const choque = reservas.find(r => inicio < r.fin && fin > r.inicio);
  if (choque) {
    return {
      ok: false,
      mensaje: "Conflicto: la sala ya está reservada de " + aTexto(choque.inicio) + " a " + aTexto(choque.fin) + "."
    };
  }
  return { ok: true, inicio, fin };
}
// ===== LOGICA-FIN =====

// Reserva inicial (en memoria, se pierde al recargar)
const reservas = [{ inicio: 10 * 60, fin: 12 * 60, origen: "Reserva existente" }];

const form = document.getElementById("formulario");
const campoInicio = document.getElementById("inicio");
const campoFin = document.getElementById("fin");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("lista");
const linea = document.getElementById("lineaTiempo");

function mostrarMensaje(tipo, texto) {
  mensaje.className = tipo;
  mensaje.textContent = texto;
}

function dibujar() {
  const ordenadas = [...reservas].sort((a, b) => a.inicio - b.inicio);

  lista.innerHTML = "";
  ordenadas.forEach(r => {
    const li = document.createElement("li");
    const h = document.createElement("span");
    h.className = "horario";
    h.textContent = aTexto(r.inicio) + " a " + aTexto(r.fin);
    const o = document.createElement("span");
    o.className = "origen";
    o.textContent = r.origen;
    li.append(h, o);
    lista.appendChild(li);
  });

  linea.innerHTML = "";
  const total = HORA_MAX - HORA_MIN;
  ordenadas.forEach(r => {
    const d = document.createElement("div");
    d.className = "tramo" + (r.origen === "Reserva existente" ? "" : " nuevo");
    d.style.left = ((r.inicio - HORA_MIN) / total * 100) + "%";
    d.style.width = ((r.fin - r.inicio) / total * 100) + "%";
    linea.appendChild(d);
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const resultado = validarReserva(campoInicio.value, campoFin.value, reservas);
  if (!resultado.ok) {
    mostrarMensaje("error", resultado.mensaje);
    return;
  }
  reservas.push({ inicio: resultado.inicio, fin: resultado.fin, origen: "Tu reserva" });
  dibujar();
  mostrarMensaje("ok", "Reserva confirmada para la Sala Focus A de " +
    aTexto(resultado.inicio) + " a " + aTexto(resultado.fin) + ".");
  form.reset();
});

dibujar();