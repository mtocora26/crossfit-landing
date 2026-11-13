// Carga la barra — el selector de nivel carga los discos y reescala el WOD.

const PLATES = {
  // kg: [ancho, alto, color, color del número]
  10: { w: 34, h: 196, fill: "#22713c", text: "#ffffff" },
  5: { w: 26, h: 196, fill: "#fbfaf7", text: "#141517", stroke: "#cfc9bd" },
  1.25: { w: 14, h: 92, fill: "#4a4f56", text: null, stroke: "#26282c" }
};

const LEVELS = {
  inicial: {
    bar: 15,
    plates: [],
    detail: "Barra técnica de 15 kg, sin discos",
    reps: ["15", "12", "9"],
    note: "Primera semana: 15, 12 y 9 repeticiones con la barra técnica y remo en anillas. La meta es moverse bien, no rápido."
  },
  escalado: {
    bar: 20,
    plates: [5],
    detail: "Barra de 20 kg + 5 kg por lado",
    reps: ["21", "15", "9"],
    note: "Mismo esquema que el original, con menos peso y una banda elástica que ayuda en las dominadas."
  },
  rx: {
    bar: 20,
    plates: [10, 1.25],
    detail: "Barra de 20 kg + 10 kg + 1,25 kg por lado",
    reps: ["21", "15", "9"],
    note: "Así está escrito: haces 21 thrusters y 21 dominadas, luego 15 y 15, luego 9 y 9. El reloj corre hasta que termines."
  }
};

const SVG_NS = "http://www.w3.org/2000/svg";
const left = document.getElementById("plates-left");
const right = document.getElementById("plates-right");
const total = document.getElementById("total");
const detail = document.getElementById("readout-detail");
const note = document.getElementById("wod-note");
const reps = [1, 2, 3].map((n) => document.getElementById(`rep-${n}`));
const groups = [...document.querySelectorAll('[role="radiogroup"]')]
  .map((g) => [...g.querySelectorAll("[data-set-level]")]);
const buttons = groups.flat();

const CENTER_Y = 115;
const LEFT_START = 204;  // cara interna del collarín izquierdo
const RIGHT_START = 996; // cara interna del collarín derecho

function plateNode(kg, x, side) {
  const p = PLATES[kg];
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", `plate off-${side}`);

  const r = document.createElementNS(SVG_NS, "rect");
  r.setAttribute("x", x);
  r.setAttribute("y", CENTER_Y - p.h / 2);
  r.setAttribute("width", p.w);
  r.setAttribute("height", p.h);
  r.setAttribute("rx", Math.min(6, p.w / 3));
  r.setAttribute("fill", p.fill);
  if (p.stroke) {
    r.setAttribute("stroke", p.stroke);
    r.setAttribute("stroke-width", "1.5");
  }
  g.appendChild(r);

  // borde de caucho más oscuro en los extremos del disco
  if (p.text) {
    const rim = document.createElementNS(SVG_NS, "rect");
    rim.setAttribute("x", x);
    rim.setAttribute("y", CENTER_Y - p.h / 2);
    rim.setAttribute("width", p.w);
    rim.setAttribute("height", p.h);
    rim.setAttribute("rx", Math.min(6, p.w / 3));
    rim.setAttribute("fill", "none");
    rim.setAttribute("stroke", "rgba(0,0,0,.18)");
    rim.setAttribute("stroke-width", "2");
    g.appendChild(rim);

    const t = document.createElementNS(SVG_NS, "text");
    t.setAttribute("class", "plate-num");
    t.setAttribute("x", x + p.w / 2);
    t.setAttribute("y", CENTER_Y - p.h / 2 + 24);
    t.setAttribute("fill", p.text);
    t.textContent = kg;
    g.appendChild(t);
  }
  return g;
}

function loadBar(level) {
  const data = LEVELS[level];
  const old = [...left.children, ...right.children];
  old.forEach((n) => {
    n.classList.add(n.parentNode === left ? "off-left" : "off-right");
    setTimeout(() => n.remove(), 450);
  });

  let lx = LEFT_START;
  let rx = RIGHT_START;
  data.plates.forEach((kg, i) => {
    const w = PLATES[kg].w;
    lx -= w + 2;
    const l = plateNode(kg, lx, "left");
    const r = plateNode(kg, rx, "right");
    rx += w + 2;
    left.appendChild(l);
    right.appendChild(r);
    // dejar que el navegador pinte la posición inicial, luego deslizar
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          l.classList.remove("off-left");
          r.classList.remove("off-right");
        }, i * 90);
      });
    });
  });

  const kg = data.bar + 2 * data.plates.reduce((a, b) => a + b, 0);
  total.textContent = kg.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  detail.textContent = data.detail;
  note.textContent = data.note;
  data.reps.forEach((v, i) => (reps[i].textContent = v));
}

// Los dos selectores (hero y pizarra del WOD) comparten el mismo nivel.
function setLevel(level, focusIn = null) {
  document.body.dataset.level = level;
  buttons.forEach((b) => {
    const on = b.dataset.setLevel === level;
    b.setAttribute("aria-checked", on);
    b.tabIndex = on ? 0 : -1;
  });
  if (focusIn) focusIn.find((b) => b.dataset.setLevel === level).focus();
  loadBar(level);
}

groups.forEach((group) => {
  group.forEach((b, i) => {
    b.addEventListener("click", () => setLevel(b.dataset.setLevel));
    b.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = group[(i + step + group.length) % group.length];
      setLevel(next.dataset.setLevel, group);
    });
  });
});

setLevel("rx");

// En pantallas angostas acercamos la vista a los discos (recortamos parte de las mangas).
const svg = document.getElementById("barbell");
const narrow = window.matchMedia("(max-width: 640px)");
const fitView = () => svg.setAttribute("viewBox", narrow.matches ? "95 15 1010 200" : "0 0 1200 230");
narrow.addEventListener("change", fitView);
fitView();

// Marca en el menú la sección que se está leyendo.
const navLinks = [...document.querySelectorAll(".top nav a")];
const sectionFor = (a) => document.querySelector(a.getAttribute("href")).closest("section");
const seen = new Map();
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => seen.set(e.target, e.isIntersecting));
  const current = navLinks.find((a) => seen.get(sectionFor(a)));
  navLinks.forEach((a) => {
    if (a === current) {
      a.setAttribute("aria-current", "true");
      if (narrow.matches) a.parentElement.scrollTo({ left: a.offsetLeft - 24 });
    } else a.removeAttribute("aria-current");
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach((a) => spy.observe(sectionFor(a)));
