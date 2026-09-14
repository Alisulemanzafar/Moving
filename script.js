const section = document.getElementById('truckSection');
const canvas = document.getElementById('truckCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const loading = document.getElementById('loading');
const loadPercent = document.getElementById('loadPercent');
const heroContent = document.getElementById('heroContent');
const scrollHint = document.getElementById('scrollHint');

const FRAME_COUNT = 192;
const frames = new Array(FRAME_COUNT);
let loaded = 0;
let targetProgress = 0;
let smoothProgress = 0;
let lastFrame = -1;
let rafPending = false;

function frameUrl(i) {
  return `frames/frame-${String(i + 1).padStart(3, '0')}.webp`;
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  lastFrame = -1;
}

function drawCover(img) {
  if (!img || !img.complete) return;
  const cw = canvas.width, ch = canvas.height;
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

function drawFrame(index) {
  index = Math.max(0, Math.min(FRAME_COUNT - 1, index));
  if (index === lastFrame) return;
  let img = frames[index];
  if (!img || !img.complete) {
    for (let d = 1; d < 12 && (!img || !img.complete); d++) {
      img = frames[Math.max(0, index - d)] || frames[Math.min(FRAME_COUNT - 1, index + d)];
    }
  }
  if (img && img.complete) {
    drawCover(img);
    lastFrame = index;
  }
}

function getProgress() {
  const rect = section.getBoundingClientRect();
  const distance = Math.max(1, section.offsetHeight - innerHeight);
  return Math.max(0, Math.min(1, -rect.top / distance));
}

function onScroll() {
  targetProgress = getProgress();
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; });
  }
}

function animate() {
  // Time-based-feeling interpolation: smooth enough to remove wheel/touch jumps,
  // but responsive enough that the truck still feels attached to the scroll.
  smoothProgress += (targetProgress - smoothProgress) * 0.095;
  if (Math.abs(targetProgress - smoothProgress) < 0.00015) smoothProgress = targetProgress;

  const frame = Math.round(smoothProgress * (FRAME_COUNT - 1));
  drawFrame(frame);

  // Subtle UI choreography, without moving the actual road footage.
  const fade = Math.max(0, 1 - Math.max(0, smoothProgress - 0.58) / 0.25);
  heroContent.style.opacity = fade;
  heroContent.style.transform = `translate3d(0, ${-smoothProgress * 24}px, 0)`;
  scrollHint.style.opacity = Math.max(0, 1 - smoothProgress * 8);

  requestAnimationFrame(animate);
}

function preloadFrames() {
  // Load first frame immediately, then the rest. Image sequence avoids expensive
  // MP4 seeking on every scroll event, which is the main cause of stutter.
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.decoding = 'async';
    img.src = frameUrl(i);
    img.onload = () => {
      loaded++;
      loadPercent.textContent = Math.round((loaded / FRAME_COUNT) * 100) + '%';
      if (i === 0) drawFrame(0);
      if (loaded >= Math.min(36, FRAME_COUNT)) loading.classList.add('ready');
    };
    frames[i] = img;
  }
}

resizeCanvas();
targetProgress = smoothProgress = getProgress();
preloadFrames();
animate();
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { resizeCanvas(); onScroll(); }, { passive: true });
