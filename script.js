const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

const TEX = 256;
const RING_TILT = -0.42;

const planets = [
  { name: "Mercury", radius: 8, orbit: 78, speed: 0.82, spin: 0.35, paint: paintMercury, glow: "rgba(190,180,160,0.25)", distance: "57.9 million km", period: "88 Earth days", diameter: "4,879 km", description: "The smallest planet, and the one nearest the Sun. Its cratered surface swings from searing day to freezing night because it barely has an atmosphere." },
  { name: "Venus", radius: 12, orbit: 118, speed: 0.62, spin: 0.12, paint: paintVenus, glow: "rgba(230,200,140,0.35)", distance: "108.2 million km", period: "225 Earth days", diameter: "12,104 km", description: "A rocky world wrapped in thick yellow clouds. A runaway greenhouse effect makes Venus the hottest planet in the solar system." },
  { name: "Earth", radius: 13, orbit: 164, speed: 0.5, spin: 0.55, paint: paintEarth, glow: "rgba(120,180,255,0.4)", atmosphere: "rgba(150, 205, 255, 0.7)", distance: "149.6 million km", period: "365.25 days", diameter: "12,742 km", description: "Our home, and the only world known to host life. Liquid oceans, weather, and a protective atmosphere set it apart from its neighbors." },
  { name: "Mars", radius: 10, orbit: 210, speed: 0.4, spin: 0.5, paint: paintMars, glow: "rgba(210,100,70,0.28)", distance: "227.9 million km", period: "687 Earth days", diameter: "6,779 km", description: "A cold desert world with the solar system’s largest volcano and canyon. Iron-rich dust gives Mars its rusty red color." },
  { name: "Jupiter", radius: 28, orbit: 286, speed: 0.22, spin: 0.9, paint: paintJupiter, glow: "rgba(220,180,130,0.22)", distance: "778 million km", period: "11.9 Earth years", diameter: "139,820 km", description: "The largest planet, a giant of hydrogen, helium, and storms. Its Great Red Spot is a cyclone that has raged for centuries." },
  { name: "Saturn", radius: 24, orbit: 378, speed: 0.16, spin: 0.8, paint: paintSaturn, glow: "rgba(230,210,160,0.22)", rings: true, distance: "1.43 billion km", period: "29.5 Earth years", diameter: "116,460 km", description: "A pale gas giant circled by bright rings of ice and rock. The rings stretch hundreds of thousands of kilometers, yet are only tens of meters thick." },
  { name: "Uranus", radius: 16, orbit: 458, speed: 0.11, spin: 0.4, paint: paintUranus, glow: "rgba(150,230,220,0.25)", distance: "2.87 billion km", period: "84 Earth years", diameter: "50,724 km", description: "An ice giant that spins on its side. Methane in its atmosphere gives Uranus a pale blue-green color and faint rings." },
  { name: "Neptune", radius: 16, orbit: 530, speed: 0.09, spin: 0.45, paint: paintNeptune, glow: "rgba(80,120,230,0.28)", distance: "4.5 billion km", period: "165 Earth years", diameter: "49,244 km", description: "The most distant planet, and the windiest. Deep blue storms race around this cold ice giant at the edge of the solar system." },
];

planets.forEach((planet, index) => {
  planet.angle = (index / planets.length) * Math.PI * 1.7 + 0.4;
  planet.rotation = index * 0.8;
  const surface = document.createElement("canvas");
  surface.width = surface.height = TEX;
  planet.paint(surface.getContext("2d"), TEX);
  planet.texture = surface;
});

const stars = [];
const dust = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seedStars() {
  stars.length = 0;
  dust.length = 0;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const count = Math.floor((width * height) / 2800);
  for (let i = 0; i < count; i += 1) {
    const bright = Math.random() > 0.97;
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: bright ? Math.random() * 1.4 + 1.1 : Math.random() * 1.1 + 0.2,
      a: bright ? 0.95 : Math.random() * 0.55 + 0.2,
      tw: Math.random() * 2 + 0.4,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? "190, 210, 255" : "255, 214, 170") : "255, 255, 255",
      flare: bright,
    });
  }
  for (let i = 0; i < 48; i += 1) {
    dust.push({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 0.015 + 0.004,
      a: Math.random() * 0.25 + 0.05,
    });
  }
}

function drawBackdrop(time) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const wash = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.48, Math.max(width, height) * 0.62);
  wash.addColorStop(0, "#141833");
  wash.addColorStop(0.45, "#0a0d1c");
  wash.addColorStop(1, "#03040c");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width * 0.5, height * 0.5);
  ctx.rotate(-0.55);
  const band = ctx.createLinearGradient(0, -height * 0.28, 0, height * 0.28);
  band.addColorStop(0, "rgba(80, 90, 160, 0)");
  band.addColorStop(0.5, "rgba(170, 180, 230, 0.09)");
  band.addColorStop(1, "rgba(80, 90, 160, 0)");
  ctx.fillStyle = band;
  ctx.fillRect(-width, -height * 0.3, width * 2, height * 0.6);
  ctx.restore();

  const clouds = [
    [0.18, 0.72, 280, "70, 50, 140"],
    [0.82, 0.22, 240, "40, 70, 140"],
    [0.7, 0.78, 200, "120, 60, 90"],
  ];
  for (const [nx, ny, radius, color] of clouds) {
    const nebula = ctx.createRadialGradient(nx * width, ny * height, 0, nx * width, ny * height, radius);
    nebula.addColorStop(0, `rgba(${color}, 0.16)`);
    nebula.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = nebula;
    ctx.beginPath();
    ctx.arc(nx * width, ny * height, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const star of stars) {
    const alpha = star.a * (0.55 + 0.45 * Math.sin(time * star.tw + star.phase));
    const x = star.x * width;
    const y = star.y * height;
    ctx.fillStyle = `rgba(${star.hue}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, star.r, 0, Math.PI * 2);
    ctx.fill();
    if (star.flare) {
      ctx.strokeStyle = `rgba(${star.hue}, ${alpha * 0.55})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x - star.r * 4, y);
      ctx.lineTo(x + star.r * 4, y);
      ctx.moveTo(x, y - star.r * 4);
      ctx.lineTo(x, y + star.r * 4);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  for (const mote of dust) {
    mote.y -= mote.s * 0.15;
    if (mote.y < 0) mote.y += 1;
    ctx.globalAlpha = mote.a;
    ctx.fillRect(mote.x * width, mote.y * height, 1.2, 1.2);
  }
  ctx.globalAlpha = 1;
}

function drawSun(time) {
  const pulse = 1 + Math.sin(time * 1.7) * 0.035;

  for (let layer = 4; layer >= 1; layer -= 1) {
    const radius = (34 + layer * 26) * (1 + Math.sin(time * 0.9 + layer) * 0.05);
    const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, radius);
    glow.addColorStop(0, `rgba(255, 214, 120, ${0.22 / layer})`);
    glow.addColorStop(0.45, `rgba(255, 120, 40, ${0.08 / layer})`);
    glow.addColorStop(1, "rgba(255, 80, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.rotate(time * 0.08);
  for (let i = 0; i < 14; i += 1) {
    const reach = 78 + Math.sin(time * 1.6 + i) * 14;
    ctx.rotate((Math.PI * 2) / 14);
    const ray = ctx.createLinearGradient(18, 0, reach, 0);
    ray.addColorStop(0, "rgba(255, 230, 170, 0.28)");
    ray.addColorStop(1, "rgba(255, 140, 40, 0)");
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.moveTo(18, -2.2);
    ctx.lineTo(reach, 0);
    ctx.lineTo(18, 2.2);
    ctx.fill();
  }
  ctx.restore();

  const coreRadius = 24 * pulse;
  const body = ctx.createRadialGradient(-7, -8, 2, 2, 3, coreRadius);
  body.addColorStop(0, "#fff8dc");
  body.addColorStop(0.35, "#ffd15a");
  body.addColorStop(0.72, "#ff9a2a");
  body.addColorStop(1, "#e25a12");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.clip();
  ctx.rotate(time * 0.22);
  for (let i = 0; i < 16; i += 1) {
    const angle = i * 1.35;
    const dist = (i % 6) * 3.2;
    ctx.fillStyle = i % 2 === 0 ? "rgba(255, 246, 210, 0.28)" : "rgba(190, 70, 10, 0.18)";
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 4 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawOrbits() {
  ctx.lineWidth = 1;
  for (const planet of planets) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(198, 208, 240, 0.16)";
    ctx.arc(0, 0, planet.orbit, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPlanet(planet, x, y) {
  const { radius } = planet;
  const distance = Math.hypot(x, y) || 1;
  const lx = -x / distance;
  const ly = -y / distance;

  if (planet.rings) drawRings(x, y, radius, false);

  const halo = ctx.createRadialGradient(x, y, radius * 0.6, x, y, radius * 1.8);
  halo.addColorStop(0, planet.glow);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(planet.rotation);
  ctx.drawImage(planet.texture, -radius, -radius, radius * 2, radius * 2);
  ctx.restore();

  const shade = ctx.createLinearGradient(
    x + lx * radius,
    y + ly * radius,
    x - lx * radius,
    y - ly * radius
  );
  shade.addColorStop(0, "rgba(255, 246, 226, 0.38)");
  shade.addColorStop(0.32, "rgba(255, 255, 255, 0.05)");
  shade.addColorStop(0.58, "rgba(8, 10, 30, 0.12)");
  shade.addColorStop(1, "rgba(2, 3, 12, 0.9)");
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  const highlight = ctx.createRadialGradient(
    x + lx * radius * 0.42,
    y + ly * radius * 0.42,
    0,
    x + lx * radius * 0.42,
    y + ly * radius * 0.42,
    radius * 0.62
  );
  highlight.addColorStop(0, "rgba(255, 255, 255, 0.42)");
  highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (planet.atmosphere) {
    const lightAngle = Math.atan2(ly, lx);
    ctx.beginPath();
    ctx.strokeStyle = planet.atmosphere;
    ctx.lineWidth = 2.4;
    ctx.arc(x, y, radius + 1.8, lightAngle - 1.2, lightAngle + 1.2);
    ctx.stroke();
  }

  if (planet.rings) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(RING_TILT);
    ctx.scale(1, 0.34);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    drawRings(x, y, radius, true);
  }
}

function drawRings(x, y, radius, front) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(RING_TILT);
  ctx.beginPath();
  const outer = radius * 2.05;
  ctx.rect(-outer - 4, front ? 0 : -outer - 4, outer * 2 + 8, outer + 4);
  ctx.clip();
  ctx.scale(1, 0.34);

  const bands = [
    [1.28, 1.48, "rgba(150, 132, 96, 0.35)"],
    [1.5, 1.78, "rgba(236, 220, 180, 0.78)"],
    [1.78, 1.86, "rgba(40, 32, 20, 0.15)"],
    [1.86, 2.05, "rgba(214, 196, 150, 0.62)"],
  ];
  for (const [inner, outerEdge, color] of bands) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * outerEdge, 0, Math.PI * 2);
    ctx.arc(0, 0, radius * inner, 0, Math.PI * 2, true);
    ctx.fillStyle = color;
    ctx.fill("evenodd");
  }
  ctx.restore();
}

function paintMercury(g, s) {
  g.fillStyle = "#9a9084";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 70; i += 1) {
    const crater = 3 + (i % 7);
    g.fillStyle = i % 3 === 0 ? "#6f675e" : "#c3b8aa";
    g.beginPath();
    g.arc((i * 47) % s, (i * 29) % s, crater, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(70, 64, 58, 0.45)";
    g.lineWidth = 1;
    g.stroke();
  }
}

function paintVenus(g, s) {
  const base = g.createLinearGradient(0, 0, s, s);
  base.addColorStop(0, "#f3e2b0");
  base.addColorStop(1, "#c8964a");
  g.fillStyle = base;
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 2) {
    const wave = Math.sin(y * 0.08) * 18;
    g.strokeStyle = y % 4 === 0 ? "rgba(255, 236, 190, 0.35)" : "rgba(150, 90, 30, 0.18)";
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(s * 0.3, y + wave, s * 0.7, y - wave, s, y + wave * 0.3);
    g.stroke();
  }
}

function paintEarth(g, s) {
  const ocean = g.createLinearGradient(0, 0, 0, s);
  ocean.addColorStop(0, "#1a4f86");
  ocean.addColorStop(0.5, "#1f6f9a");
  ocean.addColorStop(1, "#163e78");
  g.fillStyle = ocean;
  g.fillRect(0, 0, s, s);

  g.fillStyle = "#eef6ff";
  g.fillRect(0, 0, s, s * 0.07);
  g.fillRect(0, s * 0.9, s, s * 0.1);

  const lands = [
    ["#3e8f4c", 0.24, 0.36, 0.1, 0.16, 0.5],
    ["#2f7a45", 0.3, 0.55, 0.055, 0.12, 0.2],
    ["#6d9144", 0.54, 0.42, 0.09, 0.08, -0.4],
    ["#c2a15a", 0.56, 0.56, 0.06, 0.11, 0.15],
    ["#3f8a52", 0.74, 0.38, 0.12, 0.09, 0.3],
    ["#2f6e55", 0.78, 0.62, 0.08, 0.06, -0.2],
  ];
  for (const [color, x, y, rx, ry, rot] of lands) {
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(s * x, s * y, s * rx, s * ry, rot, 0, Math.PI * 2);
    g.fill();
  }

  g.fillStyle = "rgba(255, 255, 255, 0.38)";
  const clouds = [
    [0.32, 0.3, 0.12, 0.04],
    [0.62, 0.34, 0.1, 0.035],
    [0.46, 0.68, 0.14, 0.04],
    [0.72, 0.5, 0.08, 0.03],
  ];
  for (const [x, y, rx, ry] of clouds) {
    g.beginPath();
    g.ellipse(s * x, s * y, s * rx, s * ry, 0.2, 0, Math.PI * 2);
    g.fill();
  }
}

function paintMars(g, s) {
  const ground = g.createLinearGradient(0, 0, 0, s);
  ground.addColorStop(0, "#e07a55");
  ground.addColorStop(0.5, "#b8432e");
  ground.addColorStop(1, "#8d3a28");
  g.fillStyle = ground;
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#7a3224";
  g.beginPath();
  g.ellipse(s * 0.4, s * 0.48, s * 0.16, s * 0.1, 0.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#d8c3a4";
  g.fillRect(0, 0, s, s * 0.08);
  g.fillRect(0, s * 0.9, s, s * 0.1);
  for (let i = 0; i < 24; i += 1) {
    g.fillStyle = "rgba(90, 30, 20, 0.35)";
    g.beginPath();
    g.arc((i * 53) % s, (i * 37) % s, 2 + (i % 4), 0, Math.PI * 2);
    g.fill();
  }
}

function paintBands(g, s, palette, waves) {
  for (let y = 0; y < s; y += 1) {
    const t = y / s;
    const shift = Math.sin(t * Math.PI * waves) * 0.08;
    const index = Math.min(palette.length - 1, Math.floor(((t + shift + 1) % 1) * palette.length));
    g.fillStyle = palette[index];
    g.fillRect(0, y, s, 1);
  }
}

function paintJupiter(g, s) {
  paintBands(g, s, ["#e7d3b0", "#c9895a", "#f0e0c4", "#b87445", "#edd7ae", "#a8643e", "#f4e6cc", "#d7a36a"], 7);
  g.fillStyle = "#c4473a";
  g.beginPath();
  g.ellipse(s * 0.62, s * 0.62, s * 0.11, s * 0.07, -0.4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(255, 220, 190, 0.45)";
  g.lineWidth = 3;
  g.stroke();
}

function paintSaturn(g, s) {
  paintBands(g, s, ["#f3e6c4", "#e2c98a", "#f7edd4", "#d7b56a", "#f1e2bc", "#c9a15c"], 5);
}

function paintUranus(g, s) {
  const ice = g.createLinearGradient(0, 0, s, s);
  ice.addColorStop(0, "#d9fffb");
  ice.addColorStop(0.5, "#7ed0cb");
  ice.addColorStop(1, "#4e9eab");
  g.fillStyle = ice;
  g.fillRect(0, 0, s, s);
  g.strokeStyle = "rgba(255, 255, 255, 0.18)";
  for (let y = 30; y < s; y += 28) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(s, y + 6);
    g.stroke();
  }
}

function paintNeptune(g, s) {
  const deep = g.createLinearGradient(0, 0, 0, s);
  deep.addColorStop(0, "#4d74e0");
  deep.addColorStop(0.55, "#243e9e");
  deep.addColorStop(1, "#1a2d78");
  g.fillStyle = deep;
  g.fillRect(0, 0, s, s);
  g.fillStyle = "rgba(230, 240, 255, 0.75)";
  g.beginPath();
  g.ellipse(s * 0.58, s * 0.42, s * 0.08, s * 0.045, 0.3, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(180, 200, 255, 0.2)";
  for (let y = 20; y < s; y += 34) {
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(s * 0.3, y + 8, s * 0.6, y - 8, s, y);
    g.stroke();
  }
}

const info = document.getElementById("info");
const infoName = document.getElementById("info-name");
const infoDesc = document.getElementById("info-desc");
const infoDistance = document.getElementById("info-distance");
const infoPeriod = document.getElementById("info-period");
const infoDiameter = document.getElementById("info-diameter");

let selected = null;
let placed = [];
const camera = { focusX: 0, focusY: 0, zoom: 1, anchorX: 0.5, anchorY: 0.52 };
const move = { fromX: 0, fromY: 0, fromZoom: 1, fromAx: 0.5, fromAy: 0.52, t: 1 };
const view = { focusX: 0, focusY: 0, scale: 1, anchorX: 0.5, anchorY: 0.52, width: 1, height: 1 };

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function focusAnchor(width) {
  return width < 780 ? { x: 0.5, y: 0.32 } : { x: 0.6, y: 0.4 };
}

function zoomFor(planet, width, height) {
  const fit = Math.min(width, height) / 1180;
  const extent = planet.rings ? planet.radius * 2.5 : planet.radius * 1.65;
  const span = width < 780
    ? Math.min(width * 0.32, height * 0.2)
    : Math.min(width * 0.2, height * 0.22);
  return Math.max(span, 64) / (extent * fit);
}

function beginMove() {
  move.fromX = camera.focusX;
  move.fromY = camera.focusY;
  move.fromZoom = camera.zoom;
  move.fromAx = camera.anchorX;
  move.fromAy = camera.anchorY;
  move.t = 0;
}

function showInfo(planet) {
  infoName.textContent = planet.name;
  infoDesc.textContent = planet.description;
  infoDistance.textContent = planet.distance;
  infoPeriod.textContent = planet.period;
  infoDiameter.textContent = planet.diameter;
  info.classList.add("is-open");
  info.setAttribute("aria-hidden", "false");
}

function hideInfo() {
  info.classList.remove("is-open");
  info.setAttribute("aria-hidden", "true");
}

function highlight(name) {
  document.querySelectorAll(".legend button").forEach((button) => {
    const on = button.dataset.planet === name;
    button.classList.toggle("is-selected", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function focusPlanet(planet) {
  if (selected === planet && move.t >= 1) return;
  beginMove();
  selected = planet;
  showInfo(planet);
  highlight(planet.name);
}

function showOverview() {
  if (!selected && move.t >= 1) return;
  beginMove();
  selected = null;
  hideInfo();
  highlight(null);
}

function worldFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const sx = event.clientX - rect.left;
  const sy = event.clientY - rect.top;
  return {
    x: view.focusX + (sx - view.width * view.anchorX) / view.scale,
    y: view.focusY + (sy - view.height * view.anchorY) / view.scale,
  };
}

function planetAt(point) {
  let found = null;
  let best = Infinity;
  for (const body of placed) {
    const reach = Math.max(body.planet.rings ? body.planet.radius * 2.2 : body.planet.radius, 18);
    const distance = Math.hypot(point.x - body.x, point.y - body.y);
    if (distance <= reach && distance < best) {
      found = body.planet;
      best = distance;
    }
  }
  return found;
}

document.getElementById("back").addEventListener("click", showOverview);
document.querySelectorAll(".legend button").forEach((button) => {
  button.addEventListener("click", () => {
    const planet = planets.find((item) => item.name === button.dataset.planet);
    if (planet) focusPlanet(planet);
  });
});
canvas.addEventListener("click", (event) => {
  const planet = planetAt(worldFromEvent(event));
  if (planet) focusPlanet(planet);
});
canvas.addEventListener("mousemove", (event) => {
  canvas.style.cursor = planetAt(worldFromEvent(event)) ? "pointer" : "default";
});

let lastTime = 0;

function frame(time) {
  if (!lastTime) lastTime = time;
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  const seconds = time / 1000;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawBackdrop(seconds);

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  placed = planets.map((planet) => {
    planet.angle += planet.speed * dt;
    planet.rotation += planet.spin * dt;
    return {
      planet,
      x: Math.cos(planet.angle) * planet.orbit,
      y: Math.sin(planet.angle) * planet.orbit,
    };
  });

  move.t = Math.min(1, move.t + dt / 0.95);
  const eased = ease(move.t);
  const anchor = selected ? focusAnchor(width) : { x: 0.5, y: 0.52 };
  const targetZoom = selected ? zoomFor(selected, width, height) : 1;
  const target = selected ? placed.find((body) => body.planet === selected) : { x: 0, y: 0 };
  camera.focusX = move.fromX + (target.x - move.fromX) * eased;
  camera.focusY = move.fromY + (target.y - move.fromY) * eased;
  camera.zoom = move.fromZoom + (targetZoom - move.fromZoom) * eased;
  camera.anchorX = move.fromAx + (anchor.x - move.fromAx) * eased;
  camera.anchorY = move.fromAy + (anchor.y - move.fromAy) * eased;

  const fit = Math.min(width, height) / 1180;
  const scale = fit * camera.zoom;
  view.focusX = camera.focusX;
  view.focusY = camera.focusY;
  view.scale = scale;
  view.anchorX = camera.anchorX;
  view.anchorY = camera.anchorY;
  view.width = width;
  view.height = height;

  ctx.setTransform(
    dpr * scale,
    0,
    0,
    dpr * scale,
    dpr * (width * camera.anchorX - camera.focusX * scale),
    dpr * (height * camera.anchorY - camera.focusY * scale)
  );

  drawOrbits();
  drawSun(seconds);

  const drawOrder = placed.slice().sort((a, b) => a.y - b.y);
  for (const item of drawOrder) {
    drawPlanet(item.planet, item.x, item.y);
  }

  requestAnimationFrame(frame);
}

window.addEventListener("resize", () => {
  resize();
  seedStars();
});

resize();
seedStars();
requestAnimationFrame(frame);
