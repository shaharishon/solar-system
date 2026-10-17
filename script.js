const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

const planets = [
  { name: "Mercury", color: "#c4b8a5", radius: 4, orbit: 52, speed: 0.82 },
  { name: "Venus", color: "#e6c07b", radius: 6, orbit: 78, speed: 0.62 },
  { name: "Earth", color: "#4f8fd6", radius: 7, orbit: 108, speed: 0.5 },
  { name: "Mars", color: "#d4654a", radius: 5, orbit: 138, speed: 0.4 },
  { name: "Jupiter", color: "#d4a574", radius: 16, orbit: 188, speed: 0.22 },
  { name: "Saturn", color: "#e6d3a3", radius: 13, orbit: 238, speed: 0.16, ring: true },
  { name: "Uranus", color: "#7fd3c8", radius: 10, orbit: 282, speed: 0.11 },
  { name: "Neptune", color: "#4b6fd6", radius: 10, orbit: 326, speed: 0.09 },
];

const stars = [];

function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function seedStars() {
  stars.length = 0;
  const count = Math.floor((canvas.width * canvas.height) / 9000);
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.6 + 0.2,
    });
  }
}

function drawStars() {
  for (const star of stars) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${star.a})`;
    ctx.arc(star.x * canvas.width, star.y * canvas.height, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSun(cx, cy) {
  const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 48);
  glow.addColorStop(0, "rgba(255, 220, 120, 0.95)");
  glow.addColorStop(0.4, "rgba(255, 160, 40, 0.45)");
  glow.addColorStop(1, "rgba(255, 120, 20, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd56a";
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlanet(planet, cx, cy, angle) {
  const x = cx + Math.cos(angle) * planet.orbit;
  const y = cy + Math.sin(angle) * planet.orbit;

  ctx.beginPath();
  ctx.strokeStyle = "rgba(180, 196, 255, 0.22)";
  ctx.lineWidth = 1;
  ctx.arc(cx, cy, planet.orbit, 0, Math.PI * 2);
  ctx.stroke();

  if (planet.ring) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.4);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(230, 211, 163, 0.85)";
    ctx.lineWidth = 2;
    ctx.ellipse(0, 0, planet.radius + 8, planet.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = planet.color;
  ctx.beginPath();
  ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
  ctx.fill();
}

let lastTime = 0;

function frame(time) {
  if (!lastTime) lastTime = time;
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const fit = Math.min(canvas.width, canvas.height) / 760;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars();

  ctx.setTransform(fit, 0, 0, fit, cx, cy);
  drawSun(0, 0);

  for (const planet of planets) {
    planet.angle = (planet.angle || 0) + planet.speed * dt;
    drawPlanet(planet, 0, 0, planet.angle);
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
