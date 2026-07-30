/* ==========================================================================
   iLand — device illustration system
   Every product image on this site is drawn, not photographed: parametric SVG
   that takes the real finish colour and renders a dimensional device.
   Zero image assets, infinitely scalable, recolours instantly when the shopper
   picks a different finish — which is the whole point.
   ========================================================================== */

/* --- colour maths: derive a believable 3-stop body gradient from one hex --- */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
const rgbToHex = ([r, g, b]) =>
  '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

/** Shift a colour toward white (amt > 0) or black (amt < 0). */
export function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const t = amt > 0 ? 255 : 0;
  const p = Math.abs(amt);
  return rgbToHex([r + (t - r) * p, g + (t - g) * p, b + (t - b) * p]);
}

/** Perceived luminance 0–1, for deciding light-on-dark vs dark-on-light. */
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

let uid = 0;
const nextId = () => `d${(uid++).toString(36)}`;

/**
 * Shared <defs>: a diagonal body gradient plus a soft top-edge highlight.
 * Real devices read as metal because of the specular band, not the base colour.
 */
function defs(id, color) {
  const dark = luminance(color) < 0.34;
  return `
  <defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="${shade(color, dark ? 0.24 : 0.16)}"/>
      <stop offset="0.42" stop-color="${color}"/>
      <stop offset="1"    stop-color="${shade(color, dark ? -0.22 : -0.2)}"/>
    </linearGradient>
    <linearGradient id="${id}-edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#fff" stop-opacity="${dark ? 0.42 : 0.85}"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id}-screen" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="#1a1d22"/>
      <stop offset="0.5" stop-color="#0b0d10"/>
      <stop offset="1"   stop-color="#15181d"/>
    </linearGradient>
    <linearGradient id="${id}-glare" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="#fff" stop-opacity="0.14"/>
      <stop offset="0.45" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="1"    stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

/* ------------------------------------------------------------------ iPhone */
function iphone(id, color) {
  return `
  <g>
    <rect x="30" y="14" width="200" height="410" rx="34" fill="url(#${id}-body)"/>
    <rect x="30" y="14" width="200" height="410" rx="34" fill="url(#${id}-edge)"/>
    <rect x="30" y="14" width="200" height="410" rx="34" fill="none" stroke="${shade(color, -0.4)}" stroke-width="1.5" stroke-opacity="0.5"/>
    <!-- Back view on purpose: the finish colour is the thing a shopper is
         choosing, and on a front view it survives only as a 6px rail. -->
    <rect x="37" y="21" width="186" height="396" rx="28" fill="url(#${id}-glare)" opacity="0.6"/>
    <!-- camera plateau: a raised pad, slightly darker than the body, with its
         own top highlight — without it the lenses look pasted onto the back -->
    <rect x="46" y="32" width="76" height="76" rx="22" fill="${shade(color, -0.14)}"/>
    <rect x="46" y="32" width="76" height="76" rx="22" fill="url(#${id}-edge)" opacity="0.5"/>
    <rect x="46" y="32" width="76" height="76" rx="22" fill="none" stroke="${shade(color, -0.34)}" stroke-width="1" stroke-opacity="0.6"/>
    <g transform="translate(0,0)">
      <circle cx="70"  cy="56"  r="14" fill="#0c0e11"/><circle cx="70"  cy="56"  r="8" fill="#1d2836"/><circle cx="66" cy="52" r="2.6" fill="#7fa8d8" opacity="0.7"/>
      <circle cx="104" cy="56"  r="14" fill="#0c0e11"/><circle cx="104" cy="56"  r="8" fill="#1d2836"/><circle cx="100" cy="52" r="2.6" fill="#7fa8d8" opacity="0.7"/>
      <circle cx="70"  cy="90" r="14" fill="#0c0e11"/><circle cx="70"  cy="90" r="8" fill="#1d2836"/><circle cx="66" cy="86" r="2.6" fill="#7fa8d8" opacity="0.7"/>
      <circle cx="104" cy="90" r="6.5" fill="#0c0e11"/><circle cx="104" cy="90" r="3.4" fill="#d8c88f" opacity="0.85"/>
    </g>
    <!-- flash + mic, so the plateau reads as a real module and not three dots -->
    <circle cx="134" cy="46" r="5.5" fill="${shade(color, -0.3)}"/>
    <circle cx="134" cy="46" r="3.2" fill="#f2e7c4" opacity="0.9"/>
    <circle cx="134" cy="66" r="3" fill="${shade(color, -0.36)}"/>
    <!-- side buttons -->
    <rect x="27" y="96"  width="3.5" height="26" rx="1.8" fill="${shade(color, -0.32)}"/>
    <rect x="27" y="136" width="3.5" height="44" rx="1.8" fill="${shade(color, -0.32)}"/>
    <rect x="27" y="192" width="3.5" height="44" rx="1.8" fill="${shade(color, -0.32)}"/>
    <rect x="229.5" y="150" width="3.5" height="60" rx="1.8" fill="${shade(color, -0.32)}"/>
  </g>`;
}

/* -------------------------------------------------------------------- iPad */
function ipad(id, color) {
  return `
  <g>
    <rect x="24" y="18" width="212" height="402" rx="20" fill="url(#${id}-body)"/>
    <rect x="24" y="18" width="212" height="402" rx="20" fill="url(#${id}-edge)"/>
    <rect x="24" y="18" width="212" height="402" rx="20" fill="none" stroke="${shade(color, -0.4)}" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="33" y="27" width="194" height="384" rx="13" fill="url(#${id}-screen)"/>
    <rect x="33" y="27" width="194" height="384" rx="13" fill="url(#${id}-glare)"/>
    <circle cx="130" cy="22.5" r="2.6" fill="#0d1520"/>
    <circle cx="52" cy="42" r="7" fill="#0c0e11"/><circle cx="52" cy="42" r="3.6" fill="#1d2836"/>
    <rect x="88" y="14" width="52" height="4" rx="2" fill="${shade(color, -0.3)}"/>
  </g>`;
}

/* ----------------------------------------------------------------- MacBook */
function macbook(id, color) {
  return `
  <g>
    <!-- lid -->
    <rect x="52" y="46" width="356" height="238" rx="14" fill="url(#${id}-body)"/>
    <rect x="52" y="46" width="356" height="238" rx="14" fill="url(#${id}-edge)"/>
    <rect x="52" y="46" width="356" height="238" rx="14" fill="none" stroke="${shade(color, -0.4)}" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="62" y="56" width="336" height="218" rx="7" fill="url(#${id}-screen)"/>
    <rect x="62" y="56" width="336" height="218" rx="7" fill="url(#${id}-glare)"/>
    <path d="M198 56h64v11a5 5 0 0 1-5 5h-54a5 5 0 0 1-5-5z" fill="#0a0c0f"/>
    <circle cx="230" cy="61.5" r="1.8" fill="#16202c"/>
    <!-- base -->
    <path d="M30 284h400l14 20a6 6 0 0 1-5 9H21a6 6 0 0 1-5-9z" fill="${shade(color, -0.16)}"/>
    <path d="M30 284h400l4 6H26z" fill="${shade(color, 0.18)}" opacity="0.55"/>
    <rect x="196" y="290" width="68" height="6" rx="3" fill="${shade(color, -0.34)}" opacity="0.55"/>
  </g>`;
}

/* -------------------------------------------------------------------- iMac */
function imac(id, color) {
  return `
  <g>
    <rect x="34" y="34" width="392" height="266" rx="14" fill="url(#${id}-body)"/>
    <rect x="34" y="34" width="392" height="266" rx="14" fill="url(#${id}-edge)"/>
    <rect x="44" y="44" width="372" height="216" rx="6" fill="url(#${id}-screen)"/>
    <rect x="44" y="44" width="372" height="216" rx="6" fill="url(#${id}-glare)"/>
    <circle cx="230" cy="39" r="2.4" fill="#0d1520"/>
    <!-- chin -->
    <rect x="34" y="260" width="392" height="40" fill="${shade(color, 0.06)}"/>
    <rect x="34" y="260" width="392" height="40" fill="none" stroke="${shade(color, -0.35)}" stroke-width="1" stroke-opacity="0.35"/>
    <!-- stand -->
    <path d="M196 300h68l-8 62h-52z" fill="${shade(color, -0.1)}"/>
    <rect x="152" y="360" width="156" height="12" rx="6" fill="${shade(color, -0.2)}"/>
  </g>`;
}

/* ---------------------------------------------------------------- Mac mini */
function macmini(id, color) {
  return `
  <g>
    <rect x="60" y="150" width="340" height="120" rx="22" fill="url(#${id}-body)"/>
    <rect x="60" y="150" width="340" height="120" rx="22" fill="url(#${id}-edge)"/>
    <rect x="60" y="150" width="340" height="120" rx="22" fill="none" stroke="${shade(color, -0.4)}" stroke-width="1.5" stroke-opacity="0.45"/>
    <ellipse cx="230" cy="176" rx="150" ry="20" fill="${shade(color, 0.2)}" opacity="0.5"/>
    <circle cx="104" cy="252" r="4" fill="#d8dde3"/>
    <circle cx="104" cy="252" r="2" fill="#8fe3a8"/>
    <g fill="${shade(color, -0.34)}" opacity="0.5">
      <rect x="300" y="246" width="22" height="9" rx="4"/>
      <rect x="330" y="246" width="22" height="9" rx="4"/>
      <rect x="360" y="246" width="14" height="9" rx="4"/>
    </g>
  </g>`;
}

/* ------------------------------------------------------------------- Watch */
function watch(id, color) {
  return `
  <g>
    <!-- bands -->
    <path d="M96 44c0-14 8-22 22-22h68c14 0 22 8 22 22v46H96z" fill="${shade(color, -0.42)}"/>
    <path d="M96 330h112v46c0 14-8 22-22 22h-68c-14 0-22-8-22-22z" fill="${shade(color, -0.42)}"/>
    <!-- case -->
    <rect x="72" y="76" width="160" height="264" rx="52" fill="url(#${id}-body)"/>
    <rect x="72" y="76" width="160" height="264" rx="52" fill="url(#${id}-edge)"/>
    <rect x="72" y="76" width="160" height="264" rx="52" fill="none" stroke="${shade(color, -0.4)}" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="84" y="88" width="136" height="240" rx="42" fill="url(#${id}-screen)"/>
    <rect x="84" y="88" width="136" height="240" rx="42" fill="url(#${id}-glare)"/>
    <!-- dial -->
    <text x="152" y="196" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="46" font-weight="600" fill="#f4f6f8" opacity="0.92">10:09</text>
    <circle cx="152" cy="240" r="20" fill="none" stroke="#6ee7a8" stroke-width="5" stroke-opacity="0.85" stroke-linecap="round" stroke-dasharray="96 40" transform="rotate(-90 152 240)"/>
    <!-- crown -->
    <rect x="232" y="150" width="10" height="34" rx="5" fill="${shade(color, -0.2)}"/>
    <rect x="232" y="196" width="8" height="30" rx="4" fill="${shade(color, -0.3)}"/>
  </g>`;
}

/* ---------------------------------------------------------------- Apple TV */
function appletv(id, color) {
  return `
  <g>
    <rect x="86" y="150" width="288" height="112" rx="16" fill="url(#${id}-body)"/>
    <rect x="86" y="150" width="288" height="112" rx="16" fill="url(#${id}-edge)"/>
    <ellipse cx="230" cy="172" rx="126" ry="16" fill="${shade(color, 0.16)}" opacity="0.35"/>
    <circle cx="118" cy="246" r="3.5" fill="#e8ecf1" opacity="0.8"/>
    <!-- remote -->
    <rect x="392" y="120" width="44" height="150" rx="16" fill="${shade(color, 0.42)}"/>
    <rect x="392" y="120" width="44" height="150" rx="16" fill="none" stroke="${shade(color, -0.2)}" stroke-width="1" stroke-opacity="0.4"/>
    <circle cx="414" cy="156" r="15" fill="none" stroke="${shade(color, -0.1)}" stroke-width="3" stroke-opacity="0.55"/>
    <rect x="402" y="190" width="24" height="7" rx="3.5" fill="${shade(color, -0.1)}" opacity="0.5"/>
    <rect x="402" y="206" width="24" height="7" rx="3.5" fill="${shade(color, -0.1)}" opacity="0.5"/>
    <rect x="402" y="222" width="24" height="7" rx="3.5" fill="${shade(color, -0.1)}" opacity="0.5"/>
  </g>`;
}

/* ---------------------------------------------------------------- HomePod  */
function homepod(id, color) {
  const mesh = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 14; c++) {
      const x = 96 + c * 17 + (r % 2 ? 8 : 0);
      const y = 128 + r * 17;
      const dx = (x - 230) / 132, dy = (y - 196) / 78;
      if (dx * dx + dy * dy > 0.92) continue;
      mesh.push(`<circle cx="${x}" cy="${y}" r="3.1"/>`);
    }
  }
  return `
  <g>
    <path d="M114 152a116 90 0 0 1 232 0v52a116 90 0 0 1-232 0z" fill="url(#${id}-body)"/>
    <ellipse cx="230" cy="152" rx="116" ry="86" fill="url(#${id}-body)"/>
    <ellipse cx="230" cy="152" rx="116" ry="86" fill="url(#${id}-edge)"/>
    <g fill="${shade(color, -0.3)}" opacity="0.4">${mesh.join('')}</g>
    <ellipse cx="230" cy="136" rx="66" ry="42" fill="${shade(color, -0.5)}" opacity="0.5"/>
    <ellipse cx="230" cy="134" rx="52" ry="32" fill="#0d1013" opacity="0.55"/>
    <ellipse cx="230" cy="132" rx="30" ry="18" fill="#5ac8fa" opacity="0.28"/>
    <ellipse cx="230" cy="132" rx="16" ry="9" fill="#c86bd8" opacity="0.3"/>
  </g>`;
}

/* ---------------------------------------------------------------- AirPods  */
function airpods(id, color) {
  const bud = (x, y) => `
    <g transform="translate(${x} ${y})">
      <ellipse cx="0" cy="0" rx="30" ry="26" fill="url(#${id}-body)"/>
      <ellipse cx="0" cy="0" rx="30" ry="26" fill="url(#${id}-edge)"/>
      <ellipse cx="-3" cy="-4" rx="13" ry="11" fill="${shade(color, -0.3)}" opacity="0.35"/>
      <path d="M-9 20c0 26 3 44 3 58a10 10 0 0 0 20 0c0-14 3-32 3-58z" fill="url(#${id}-body)"/>
      <path d="M-9 20c0 26 3 44 3 58a10 10 0 0 0 20 0c0-14 3-32 3-58z" fill="url(#${id}-edge)" opacity="0.6"/>
      <rect x="-7" y="52" width="14" height="3" rx="1.5" fill="${shade(color, -0.35)}" opacity="0.4"/>
    </g>`;
  return `
  <g>
    ${bud(126, 96)}
    ${bud(196, 96)}
    <rect x="106" y="240" width="248" height="150" rx="46" fill="url(#${id}-body)"/>
    <rect x="106" y="240" width="248" height="150" rx="46" fill="url(#${id}-edge)"/>
    <rect x="106" y="240" width="248" height="150" rx="46" fill="none" stroke="${shade(color, -0.32)}" stroke-width="1.5" stroke-opacity="0.4"/>
    <path d="M106 292h248" stroke="${shade(color, -0.28)}" stroke-width="1.5" stroke-opacity="0.35"/>
    <circle cx="230" cy="344" r="5" fill="${shade(color, -0.3)}" opacity="0.5"/>
    <circle cx="230" cy="344" r="2.4" fill="#8fe3a8"/>
  </g>`;
}

/* --------------------------------------------------------- Generic gadget  */
function accessory(id, color) {
  return `
  <g>
    <circle cx="230" cy="196" r="104" fill="url(#${id}-body)"/>
    <circle cx="230" cy="196" r="104" fill="url(#${id}-edge)"/>
    <circle cx="230" cy="196" r="104" fill="none" stroke="${shade(color, -0.34)}" stroke-width="1.5" stroke-opacity="0.4"/>
    <circle cx="230" cy="196" r="66" fill="none" stroke="${shade(color, -0.3)}" stroke-width="2" stroke-opacity="0.32"/>
    <circle cx="230" cy="196" r="30" fill="${shade(color, -0.12)}" opacity="0.5"/>
    <path d="M230 300c0 40 -6 62 -6 84a24 24 0 0 0 48 0" fill="none" stroke="${shade(color, -0.2)}" stroke-width="13" stroke-linecap="round" opacity="0.85"/>
  </g>`;
}

/* ------------------------------------------------------------- Gift card   */
function gift(id, color) {
  return `
  <g>
    <rect x="62" y="122" width="336" height="212" rx="20" fill="url(#${id}-body)"/>
    <rect x="62" y="122" width="336" height="212" rx="20" fill="url(#${id}-edge)"/>
    <rect x="62" y="122" width="336" height="212" rx="20" fill="none" stroke="${shade(color, -0.35)}" stroke-width="1.5" stroke-opacity="0.45"/>
    <rect x="62" y="196" width="336" height="26" fill="${shade(color, -0.34)}" opacity="0.55"/>
    <rect x="212" y="122" width="36" height="212" fill="${shade(color, -0.34)}" opacity="0.55"/>
    <circle cx="230" cy="209" r="30" fill="${shade(color, 0.2)}" opacity="0.6"/>
    <text x="230" y="222" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="34" font-weight="700"
          fill="${luminance(color) < 0.4 ? '#fff' : '#14181d'}">₾</text>
  </g>`;
}

const RENDERERS = { iphone, ipad, macbook, imac, macmini, watch, appletv, homepod, airpods, accessory, gift };

/* Each device gets the viewBox that flatters its proportions. */
const VIEWBOX = {
  iphone: '0 0 260 440', ipad: '0 0 260 440', macbook: '0 0 460 340', imac: '0 0 460 400',
  macmini: '0 0 460 400', watch: '0 0 304 420', appletv: '0 0 460 400', homepod: '0 0 460 320',
  airpods: '0 0 460 420', accessory: '0 0 460 400', gift: '0 0 460 400',
};

/**
 * Render a device as an inline SVG string.
 * @param {string} device  key from RENDERERS
 * @param {string} color   finish hex, e.g. '#4E5D6C'
 * @param {object} [opts]  { className, ariaLabel }
 */
export function deviceSVG(device, color = '#C2BCB2', opts = {}) {
  const draw = RENDERERS[device] || RENDERERS.accessory;
  const id = nextId();
  const box = VIEWBOX[device] || VIEWBOX.accessory;
  const cls = opts.className ? ` class="${opts.className}"` : '';
  const label = opts.ariaLabel
    ? ` role="img" aria-label="${opts.ariaLabel}"` : ' aria-hidden="true"';
  return `<svg${cls} viewBox="${box}" fill="none" xmlns="http://www.w3.org/2000/svg"${label}>
    ${defs(id, color)}
    ${draw(id, color)}
  </svg>`;
}

export const DEVICE_KEYS = Object.keys(RENDERERS);
