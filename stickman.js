/*  stickman.js
    10 jump variations — cycle through with any key or click.
    Selection is sequential (deterministic, not random).
*/

const stickmanEl = document.getElementById('stickman');
const labelEl = document.getElementById('label');
const hintEl = document.getElementById('hint');

// ── Helpers ────────────────────────────────────────────

function parabola(t, a, b, h) {
  if (t < a || t > b) return 0;
  const p = (t - a) / (b - a);
  return -h * 4 * p * (1 - p);
}

function getPose(poseMap, t) {
  for (const [a, b, pose] of poseMap) {
    if (t >= a && t < b) return pose;
  }
  return poseMap[poseMap.length - 1][2];
}

// ── 10 Variations ──────────────────────────────────────

const VARIATIONS = [

  // 0 — Normal
  {
    name: 'normal',
    cycleMs: 1600, jumpHeight: 100,
    airStart: 0.16, airEnd: 0.80,
    poseMap: [
      [0.00, 0.08, `  O\n /|\\\n / \\`],
      [0.08, 0.16, `  O\n /|\\\n /V\\`],
      [0.16, 0.26, ` \\O/\n  |\n / \\`],
      [0.26, 0.50, ` \\O/\n  |\n_/ \\_`],
      [0.50, 0.68, `  O\n \\|/\n_/ \\_`],
      [0.68, 0.80, `  O\n /|\\\n_/ \\_`],
      [0.80, 0.88, `  O\n /|\\\n /|\\`],
      [0.88, 0.95, `  O\n /|\\\n /V\\`],
      [0.95, 1.00, `  O\n /|\\\n / \\`],
    ],
  },

  // 1 — High Jump (very tall, slow, dramatic)
  {
    name: 'high jump',
    cycleMs: 2400, jumpHeight: 190,
    airStart: 0.18, airEnd: 0.82,
    poseMap: [
      [0.00, 0.10, `  O\n _|_\n / \\`],
      [0.10, 0.18, `  O\n _|_\n /V\\`],
      [0.18, 0.28, `  O\n \\^/\n  |`],
      [0.28, 0.48, ` \\O/\n  |\n  |`],
      [0.48, 0.58, ` \\O/\n  |\n  V`],
      [0.58, 0.74, `  O\n /|\\\n  |`],
      [0.74, 0.82, `  O\n /|\\\n_/ \\_`],
      [0.82, 0.90, `  O\n /|\\\n /|\\`],
      [0.90, 0.96, `  O\n (|)\n /V\\`],
      [0.96, 1.00, `  O\n _|_\n / \\`],
    ],
  },

  // 2 — Tiny Hop (quick, barely leaves ground)
  {
    name: 'hop',
    cycleMs: 650, jumpHeight: 28,
    airStart: 0.22, airEnd: 0.72,
    poseMap: [
      [0.00, 0.22, `  O\n /|\\\n / \\`],
      [0.22, 0.50, `  O\n /|\\\n_/ \\_`],
      [0.50, 0.72, `  O\n /|\\\n_/ \\_`],
      [0.72, 0.86, `  O\n /|\\\n /|\\`],
      [0.86, 1.00, `  O\n /|\\\n / \\`],
    ],
  },

  // 3 — Robot Jump (stiff mechanical movement, elevator arc)
  {
    name: 'robot',
    cycleMs: 2000, jumpHeight: 90,
    airStart: 0.18, airEnd: 0.78,
    poseMap: [
      [0.00, 0.10, `  O\n -|-\n / \\`],    // stand — arms rigid horizontal
      [0.10, 0.18, `  O\n -|-\n /=\\`],    // mechanical squat prep
      [0.18, 0.30, `  O\n [|]\n / \\`],    // launch — boxy enclosed torso
      [0.30, 0.50, `  O\n [|]\n  |`],      // rising stiff, legs straight down
      [0.50, 0.65, `  O\n=|=\n  |`],       // hovering at peak — arms max-wide
      [0.65, 0.78, `  O\n [|]\n  |`],      // descending stiff
      [0.78, 0.86, `  O\n -|-\n /|\\`],    // mechanical land
      [0.86, 0.93, `  O\n -|-\n /=\\`],    // rigid shock absorb
      [0.93, 1.00, `  O\n -|-\n / \\`],    // back to stand
    ],
    // Elevator movement: linear rise → pause at top → linear drop
    customY(t) {
      const h = this.jumpHeight;
      const a = this.airStart;
      const b = this.airEnd;
      if (t < a || t > b) return 0;
      const p = (t - a) / (b - a); // 0..1
      if (p < 0.35) return -h * (p / 0.35);          // linear rise
      if (p < 0.65) return -h;                        // hold at peak
      return -h * (1 - (p - 0.65) / 0.35);           // linear drop
    },
  },

  // 4 — Star Jump (full X shape at peak)
  {
    name: 'star',
    cycleMs: 1700, jumpHeight: 120,
    airStart: 0.16, airEnd: 0.78,
    poseMap: [
      [0.00, 0.08, `  O\n /|\\\n / \\`],
      [0.08, 0.16, `  O\n /|\\\n /V\\`],
      [0.16, 0.28, ` \\O/\n  |\n / \\`],
      [0.28, 0.42, ` \\O/\n  |\n/  \\`],
      [0.42, 0.58, ` \\O/\n  |\n/    \\`],  // full star — wide arms + wide legs
      [0.58, 0.68, ` \\O/\n  |\n\\  /`],
      [0.68, 0.78, `  O\n /|\\\n_/ \\_`],
      [0.78, 0.86, `  O\n /|\\\n /|\\`],
      [0.86, 0.93, `  O\n /|\\\n /V\\`],
      [0.93, 1.00, `  O\n /|\\\n / \\`],
    ],
  },

  // 5 — Tuck Jump (knees pulled to chest mid-air)
  {
    name: 'tuck',
    cycleMs: 1500, jumpHeight: 105,
    airStart: 0.16, airEnd: 0.78,
    poseMap: [
      [0.00, 0.08, `  O\n /|\\\n / \\`],
      [0.08, 0.16, `  O\n /|\\\n /V\\`],
      [0.16, 0.28, ` \\O/\n  |\n / \\`],
      [0.28, 0.42, ` \\O/\n  |\n oo`],     // knees coming to chest
      [0.42, 0.58, `  O\n(\\|/)\n oo`],    // full tuck, arms wrapped, knees up
      [0.58, 0.70, ` \\O/\n  |\n oo`],     // untucking
      [0.70, 0.78, `  O\n /|\\\n_/ \\_`],
      [0.78, 0.86, `  O\n /|\\\n /|\\`],
      [0.86, 0.93, `  O\n /|\\\n /V\\`],
      [0.93, 1.00, `  O\n /|\\\n / \\`],
    ],
  },

  // 6 — Splits Jump (legs spread flat sideways at peak)
  {
    name: 'splits',
    cycleMs: 1900, jumpHeight: 110,
    airStart: 0.15, airEnd: 0.80,
    poseMap: [
      [0.00, 0.08, `  O\n /|\\\n / \\`],
      [0.08, 0.16, `  O\n /|\\\n /V\\`],
      [0.16, 0.28, ` \\O/\n  |\n / \\`],
      [0.28, 0.42, `  O\n \\|/\n/   \\`],   // legs spreading
      [0.42, 0.58, `  O\n \\|/\n/     \\`], // full splits (legs horizontal)
      [0.58, 0.70, `  O\n \\|/\n/   \\`],
      [0.70, 0.80, `  O\n /|\\\n_/ \\_`],
      [0.80, 0.87, `  O\n /|\\\n /|\\`],
      [0.87, 0.94, `  O\n /|\\\n /V\\`],
      [0.94, 1.00, `  O\n /|\\\n / \\`],
    ],
  },

  // 7 — Flail Jump (chaotic, panicked arm flying)
  {
    name: 'flail',
    cycleMs: 1400, jumpHeight: 90,
    airStart: 0.14, airEnd: 0.76,
    poseMap: [
      [0.00, 0.08, `  O\n /|\\\n / \\`],
      [0.08, 0.14, `  O\n ~|~\n /V\\`],    // arms already going wild
      [0.14, 0.24, ` ~O~\n  |\n / \\`],    // arms wave outward from head
      [0.24, 0.36, `  O\n ~|^\n / \\`],    // asymmetric flail
      [0.36, 0.50, `  O\n ^|~\n_/ \\_`],   // other arm up
      [0.50, 0.62, ` ~O^\n  |\n_/ \\_`],   // head wobble, arm wave
      [0.62, 0.72, `  O\n ~|~\n_/ \\_`],   // both flailing
      [0.72, 0.76, `  O\n /|\\\n_/ \\_`],
      [0.76, 0.84, `  O\n /|\\\n /|\\`],
      [0.84, 0.93, `  O\n ~|~\n /V\\`],    // still jittery on absorb
      [0.93, 1.00, `  O\n /|\\\n / \\`],
    ],
  },

  // 8 — Double Bounce (two quick bounces per cycle)
  {
    name: 'double bounce',
    cycleMs: 1600, jumpHeight: 55,
    airStart: 0.04, airEnd: 0.96,
    poseMap: [
      [0.00, 0.04, `  O\n /|\\\n / \\`],
      [0.04, 0.22, ` \\O/\n  |\n_/ \\_`],  // 1st rise
      [0.22, 0.32, `  O\n \\|/\n_/ \\_`],  // 1st peak
      [0.32, 0.46, `  O\n /|\\\n_/ \\_`],  // 1st fall
      [0.46, 0.50, `  O\n /|\\\n /|\\`],   // 1st touchdown
      [0.50, 0.66, ` \\O/\n  |\n_/ \\_`],  // 2nd rise
      [0.66, 0.76, `  O\n \\|/\n_/ \\_`],  // 2nd peak
      [0.76, 0.88, `  O\n /|\\\n_/ \\_`],  // 2nd fall
      [0.88, 0.96, `  O\n /|\\\n /|\\`],   // 2nd landing
      [0.96, 1.00, `  O\n /|\\\n / \\`],
    ],
    // Override: two parabolas stitched together
    customY(t) {
      const h = this.jumpHeight;
      if (t >= 0.04 && t < 0.48) {
        const p = (t - 0.04) / 0.44;
        return -h * 4 * p * (1 - p);
      }
      if (t >= 0.50 && t < 0.94) {
        const p = (t - 0.50) / 0.44;
        return -h * 4 * p * (1 - p);
      }
      return 0;
    },
  },

  // 9 — Power Jump (explosive, deep crouch, heavy landing)
  {
    name: 'power',
    cycleMs: 2100, jumpHeight: 160,
    airStart: 0.20, airEnd: 0.82,
    poseMap: [
      [0.00, 0.08, `  O\n  |\n / \\`],
      [0.08, 0.20, `  O\n  |\n /=\\`],     // deep power squat (=  = very bent)
      [0.20, 0.30, `  O\n \\^/\n  |`],     // explosive launch, arms punching up
      [0.30, 0.50, ` \\O/\n  |\n  |`],     // soaring, legs straight down
      [0.50, 0.65, ` \\O/\n  +\n  V`],     // peak — cross body, pointed toes
      [0.65, 0.82, `  O\n /|\\\n  |`],     // fast descent
      [0.82, 0.88, `  O\n /|\\\n /|\\`],   // IMPACT
      [0.88, 0.95, `  O\n (|)\n /V\\`],    // deep shock absorb
      [0.95, 1.00, `  O\n  |\n / \\`],
    ],
    triggerShake: true,
  },

];

// ── State ──────────────────────────────────────────────

let varIndex = 0;
let startTs = null;
let prevT = 0;
let isShaking = false;
let labelTimer = null;
let introMode = false;          // true while the intro sequence is playing

const STAND_POSE = `  O\n /|\\\n / \\`; // used when frozen

// ── Label flash when switching ─────────────────────────

function showLabel(text, index) {
  labelEl.textContent = `${index + 1} / ${VARIATIONS.length}  —  ${text}`;
  labelEl.classList.add('visible');
  clearTimeout(labelTimer);
  labelTimer = setTimeout(() => labelEl.classList.remove('visible'), 2000);
}

// ── Power landing shake ──────────────────────────────────

function triggerShake() {
  if (isShaking) return;
  isShaking = true;
  let count = 0;
  const steps = 10;
  function step() {
    if (count >= steps) {
      stickmanEl.style.transform = `translateY(0px)`;
      isShaking = false;
      return;
    }
    const dx = (Math.random() - 0.5) * 7 * (1 - count / steps);
    stickmanEl.style.transform = `translateY(0px) translateX(${dx.toFixed(1)}px)`;
    count++;
    setTimeout(step, 28);
  }
  step();
}

// ── Vertical position ──────────────────────────────────

function getY(t) {
  const v = VARIATIONS[varIndex];
  // Cap to 22% of viewport height so jumps stay on-screen on mobile
  const h = Math.min(v.jumpHeight, window.innerHeight * 0.22);
  if (v.customY) {
    const scale = v.jumpHeight > 0 ? h / v.jumpHeight : 1;
    return v.customY.call(v, t) * scale;
  }
  return parabola(t, v.airStart, v.airEnd, h);
}

// ── Animation loop ─────────────────────────────────────

function loop(ts) {
  // Freeze during intro — stand still
  if (introMode) {
    stickmanEl.textContent = STAND_POSE;
    stickmanEl.style.transform = 'translateY(0px)';
    requestAnimationFrame(loop);
    return;
  }

  if (!startTs) startTs = ts;
  const v = VARIATIONS[varIndex];
  const t = ((ts - startTs) % v.cycleMs) / v.cycleMs;

  // Pose
  stickmanEl.textContent = getPose(v.poseMap, t);

  // Vertical movement
  if (!isShaking) {
    const y = getY(t);
    stickmanEl.style.transform = `translateY(${y.toFixed(2)}px)`;

    // Detect landing edge for power shake
    if (v.triggerShake && prevT < v.airEnd && t >= v.airEnd) {
      triggerShake();
    }
  }

  prevT = t;
  requestAnimationFrame(loop);
}

// ── Intro sequence (Enter key) ─────────────────────────────────

const calloutEl = document.getElementById('callout');
const calloutTextEl = document.getElementById('callout-text');

function pause(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function typeText(text, delayMs) {
  return new Promise(resolve => {
    let i = 0;
    // Blinking cursor while typing
    const cursor = document.createElement('span');
    cursor.id = 'callout-cursor';
    calloutTextEl.appendChild(cursor);

    function next() {
      if (!introMode) { cursor.remove(); resolve(); return; } // aborted
      if (i >= text.length) {
        cursor.remove();
        resolve();
        return;
      }
      // Insert character before cursor
      calloutTextEl.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(next, delayMs);
    }
    next();
  });
}

async function runIntro() {
  if (introMode) return;   // prevent double-trigger
  introMode = true;

  // Hide controls UI
  hintEl.classList.add('intro-mode');
  labelEl.classList.remove('visible');
  clearTimeout(labelTimer);

  // Clear and show callout
  calloutTextEl.innerHTML = '';
  calloutEl.classList.add('visible');
  await pause(350); // let fade-in settle

  // Line 1 — greeting
  await typeText('Hi! I am Bibek Shrestha', 65);
  await pause(700);

  // Line 2 — LinkedIn
  calloutTextEl.appendChild(document.createTextNode('\n'));
  await typeText('Find me on ', 65);

  // Inject link (no typing effect for the URL itself)
  const link = document.createElement('a');
  link.href = 'https://www.linkedin.com/in/sbibek';
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'LinkedIn';
  calloutTextEl.appendChild(link);

  // Short blinking pause after link appears
  const endCursor = document.createElement('span');
  endCursor.id = 'callout-cursor';
  calloutTextEl.appendChild(endCursor);
  await pause(300);
  endCursor.remove();

  // Hold long enough to click the link
  await pause(5000);

  // Fade out
  calloutEl.classList.remove('visible');
  await pause(400);
  calloutTextEl.innerHTML = '';

  // Restore
  hintEl.classList.remove('intro-mode');
  startTs = null;
  prevT = 0;
  introMode = false;
}

// ── Input: key map (1–9 = var 0–8, 0 = var 9) ────────

const KEY_MAP = {
  '1': 0, '2': 1, '3': 2, '4': 3, '5': 4,
  '6': 5, '7': 6, '8': 7, '9': 8, '0': 9,
};

function selectVariation(idx) {
  varIndex = idx;
  startTs = null;
  prevT = 0;
  isShaking = false;
  showLabel(VARIATIONS[idx].name, idx);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { runIntro(); return; }
  if (introMode) return;                        // block everything during intro
  if (e.key in KEY_MAP) {
    selectVariation(KEY_MAP[e.key]);
  } else if (e.key.length === 1) {
    selectVariation(e.key.charCodeAt(0) % VARIATIONS.length);
  }
});
// Click stickman to show intro
stickmanEl.addEventListener('click', (e) => {
  if (introMode) return;
  e.stopPropagation(); // prevent document click from cycling
  runIntro();
});

// Click anywhere else still cycles forward (blocked during intro)
document.addEventListener('click', () => {
  if (introMode) return;
  selectVariation((varIndex + 1) % VARIATIONS.length);
});

// ── Populate hint with key map ────────────────────────
const SHORT = ['normal', 'high', 'hop', 'robot', 'star', 'tuck', 'splits', 'flail', '×2', 'power'];
hintEl.innerHTML =
  SHORT.map((n, i) => `<span class="k">${i === 9 ? '0' : i + 1}</span>${n}`).join(' · ')
  + '<br><span class="enter-hint">click stickman or <span class="k">↵</span> about me</span>';

// ── Start ──────────────────────────────────────────────
requestAnimationFrame(loop);
