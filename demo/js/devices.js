/* ==========================================================================
   NORVA — device illustration system

   One parametric silhouette per hardware archetype, tinted from the finish the
   shopper picked. These are deliberately generic shapes: no manufacturer's
   trade dress, no product-accurate detailing. They back the hero stage, the
   category tiles and any CMS-created product that has no artwork of its own,
   and they share their geometry with the catalogue artwork in
   assets/products/ so the two never disagree.
   ========================================================================== */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
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

/** Perceived luminance 0-1, for deciding light-on-dark vs dark-on-light. */
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mixHex(hex, other, t) {
  const a = hexToRgb(hex), b = hexToRgb(other);
  return rgbToHex([0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t));
}

/* Five faces derived from one finish: a device reads as metal because of the
   specular edge, not the base colour. */
function faces(color) {
  const pale = luminance(color) >= 0.55;
  return {
    BASE:  color,
    LIT:   mixHex(color, '#FFFFFF', pale ? 0.14 : 0.30),
    EDGE:  mixHex(color, '#FFFFFF', pale ? 0.22 : 0.52),
    DARK:  mixHex(color, '#000000', 0.28),
    DEEP:  mixHex(color, '#000000', 0.46),
    GLASS: mixHex(color, '#0B0E13', 0.72),
    GLOW:  mixHex(color, '#FFFFFF', 0.62),
  };
}

let uid = 0;
const nextId = () => `d${(uid++).toString(36)}`;

/* Archetype geometry. Generated alongside assets/products/*.svg from one
   source, so a drawn device and its catalogue artwork are the same shape. */
const SHAPES = {
  band: `<path d="M164 96h72a26 26 0 0 1 26 26v156a26 26 0 0 1-26 26h-72a26 26 0 0 1-26-26V122a26 26 0 0 1 26-26Z" fill="none" stroke="__BASE__" stroke-width="30"/><path d="M164 96h72a26 26 0 0 1 26 26v156a26 26 0 0 1-26 26h-72a26 26 0 0 1-26-26V122a26 26 0 0 1 26-26Z" fill="none" stroke="__LIT__" stroke-width="9" opacity=".38"/><path d="M138 138h-0.1" stroke="__DEEP__" stroke-width="26" stroke-linecap="round" opacity=".16"/><path d="M138 160h-0.1" stroke="__DEEP__" stroke-width="26" stroke-linecap="round" opacity=".16"/><path d="M138 182h-0.1" stroke="__DEEP__" stroke-width="26" stroke-linecap="round" opacity=".16"/><path d="M138 204h-0.1" stroke="__DEEP__" stroke-width="26" stroke-linecap="round" opacity=".16"/><path d="M138 226h-0.1" stroke="__DEEP__" stroke-width="26" stroke-linecap="round" opacity=".16"/><path d="M138 248h-0.1" stroke="__DEEP__" stroke-width="26" stroke-linecap="round" opacity=".16"/><path d="M138 270h-0.1" stroke="__DEEP__" stroke-width="26" stroke-linecap="round" opacity=".16"/><rect x="170" y="176" width="60" height="48" rx="14" fill="__DARK__"/><rect x="175" y="181" width="50" height="38" rx="10" fill="__EDGE__" opacity=".75"/>`,
  buds: `<rect x="126" y="138" width="148" height="108" rx="30" fill="__DARK__"/><rect x="131" y="143" width="138" height="98" rx="26" fill="__BASE__"/><rect x="131" y="143" width="138" height="34" rx="26" fill="__LIT__" opacity=".3"/><rect x="178" y="236" width="44" height="5" rx="2.5" fill="__DEEP__" opacity=".4"/><circle cx="160" cy="96" r="24" fill="__LIT__"/><circle cx="160" cy="96" r="15" fill="__GLASS__" opacity=".55"/><path d="M152 116h16v26a8 8 0 0 1-16 0Z" fill="__LIT__"/><circle cx="240" cy="96" r="24" fill="__LIT__"/><circle cx="240" cy="96" r="15" fill="__GLASS__" opacity=".55"/><path d="M232 116h16v26a8 8 0 0 1-16 0Z" fill="__LIT__"/>`,
  cable: `<path d="M138 108C104 168 296 232 262 292" fill="none" stroke="__DARK__" stroke-width="20" stroke-linecap="round"/><path d="M138 108C104 168 296 232 262 292" fill="none" stroke="__BASE__" stroke-width="13" stroke-linecap="round"/><path d="M138 108C104 168 296 232 262 292" fill="none" stroke="__LIT__" stroke-width="4" stroke-linecap="round" opacity=".4"/><g transform="rotate(-28 138 108)"><rect x="120" y="68" width="36" height="46" rx="11" fill="__DARK__"/><rect x="124" y="72" width="28" height="38" rx="8" fill="__EDGE__"/></g><g transform="rotate(-28 262 292)"><rect x="244" y="286" width="36" height="46" rx="11" fill="__DARK__"/><rect x="248" y="290" width="28" height="38" rx="8" fill="__EDGE__"/></g>`,
  card: `<rect x="96" y="128" width="208" height="132" rx="16" fill="__DARK__"/><rect x="100" y="132" width="200" height="124" rx="13" fill="__BASE__"/><rect x="100" y="132" width="200" height="44" rx="13" fill="__LIT__" opacity=".3"/><rect x="118" y="196" width="76" height="10" rx="5" fill="__EDGE__" opacity=".7"/><rect x="118" y="216" width="48" height="8" rx="4" fill="__EDGE__" opacity=".45"/><rect x="244" y="200" width="40" height="26" rx="5" fill="__GLOW__" opacity=".55"/>`,
  case: `<path d="M148 72h104a20 20 0 0 1 20 20v216a20 20 0 0 1-20 20H148a20 20 0 0 1-20-20V92a20 20 0 0 1 20-20Z" fill="__DARK__"/><path d="M152 76h96a17 17 0 0 1 17 17v214a17 17 0 0 1-17 17h-96a17 17 0 0 1-17-17V93a17 17 0 0 1 17-17Z" fill="__BASE__"/><path d="M152 76h30v248h-30a17 17 0 0 1-17-17V93a17 17 0 0 1 17-17Z" fill="__LIT__" opacity=".28"/><rect x="150" y="92" width="92" height="46" rx="14" fill="__DEEP__" opacity=".45"/><circle cx="176" cy="115" r="12" fill="__GLASS__"/><circle cx="216" cy="115" r="12" fill="__GLASS__"/><rect x="158" y="186" width="84" height="96" rx="12" fill="__LIT__" opacity=".10"/>`,
  desktop: `<rect x="120" y="120" width="160" height="96" rx="18" fill="__DEEP__" opacity=".5"/><rect x="124" y="114" width="152" height="92" rx="16" fill="__DARK__"/><rect x="128" y="118" width="144" height="84" rx="13" fill="__BASE__"/><rect x="128" y="118" width="144" height="30" rx="13" fill="__LIT__" opacity=".40"/><rect x="142" y="158" width="62" height="7" rx="3.5" fill="__DEEP__" opacity=".35"/><circle cx="246" cy="182" r="7" fill="__GLOW__" opacity=".65"/><rect x="186" y="206" width="28" height="40" rx="6" fill="__DARK__"/><rect x="138" y="246" width="124" height="12" rx="6" fill="__BASE__"/><rect x="138" y="246" width="124" height="5" rx="2.5" fill="__LIT__" opacity=".45"/>`,
  display: `<rect x="88" y="74" width="224" height="142" rx="10" fill="__DARK__"/><rect x="94" y="80" width="212" height="130" rx="7" fill="__GLASS__"/><rect x="108" y="94" width="120" height="48" rx="5" fill="__LIT__" opacity=".18"/><rect x="108" y="156" width="150" height="5" rx="2.5" fill="__EDGE__" opacity=".3"/><rect x="186" y="216" width="28" height="42" rx="4" fill="__BASE__"/><rect x="140" y="258" width="120" height="10" rx="5" fill="__BASE__"/><rect x="140" y="258" width="120" height="4" rx="2" fill="__LIT__" opacity=".5"/>`,
  dongle: `<rect x="148" y="130" width="104" height="88" rx="14" fill="__DARK__"/><rect x="152" y="134" width="96" height="80" rx="11" fill="__BASE__"/><rect x="190" y="92" width="20" height="40" rx="6" fill="__EDGE__"/><rect x="160" y="218" width="16" height="26" rx="5" fill="__EDGE__" opacity=".8"/><rect x="184" y="218" width="16" height="26" rx="5" fill="__EDGE__" opacity=".8"/><rect x="208" y="218" width="16" height="26" rx="5" fill="__EDGE__" opacity=".8"/><rect x="232" y="218" width="16" height="26" rx="5" fill="__EDGE__" opacity=".8"/>`,
  drive: `<rect x="120" y="136" width="160" height="108" rx="16" fill="__DARK__"/><rect x="124" y="140" width="152" height="100" rx="13" fill="__BASE__"/><rect x="124" y="140" width="152" height="32" rx="13" fill="__LIT__" opacity=".3"/><rect x="140" y="200" width="60" height="8" rx="4" fill="__DEEP__" opacity=".35"/><circle cx="258" cy="204" r="6" fill="__GLOW__" opacity=".7"/>`,
  glass: `<rect x="140" y="70" width="120" height="200" rx="16" fill="__GLASS__" opacity=".35"/><rect x="140" y="70" width="120" height="200" rx="16" fill="none" stroke="__EDGE__" stroke-width="3"/><path d="M156 82 244 240" stroke="__GLOW__" stroke-width="10" stroke-linecap="round" opacity=".28"/><path d="M186 82 254 200" stroke="__GLOW__" stroke-width="5" stroke-linecap="round" opacity=".18"/>`,
  headphones: `<path d="M112 196v-46a88 88 0 0 1 176 0v46" fill="none" stroke="__BASE__" stroke-width="18" stroke-linecap="round"/><path d="M112 190v-40a88 88 0 0 1 176 0v40" fill="none" stroke="__LIT__" stroke-width="5" stroke-linecap="round" opacity=".5"/><rect x="86" y="176" width="54" height="92" rx="24" fill="__DARK__"/><rect x="91" y="181" width="44" height="82" rx="20" fill="__BASE__"/><rect x="97" y="192" width="32" height="60" rx="15" fill="__GLASS__" opacity=".5"/><rect x="260" y="176" width="54" height="92" rx="24" fill="__DARK__"/><rect x="265" y="181" width="44" height="82" rx="20" fill="__BASE__"/><rect x="271" y="192" width="32" height="60" rx="15" fill="__GLASS__" opacity=".5"/>`,
  keyboard: `<rect x="92" y="152" width="216" height="96" rx="12" fill="__DARK__"/><rect x="96" y="156" width="208" height="88" rx="9" fill="__BASE__"/><rect x="104" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="121" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="138" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="155" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="172" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="189" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="206" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="223" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="240" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="257" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="274" y="168" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="104" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="121" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="138" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="155" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="172" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="189" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="206" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="223" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="240" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="257" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="274" y="185" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="104" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="121" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="138" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="155" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="172" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="189" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="206" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="223" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="240" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="257" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="274" y="202" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="104" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="121" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="138" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="155" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="172" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="189" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="206" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="223" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="240" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="257" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="274" y="219" width="14" height="14" rx="3" fill="__DEEP__" opacity=".3"/><rect x="155" y="236" width="90" height="7" rx="3.5" fill="__DEEP__" opacity=".3"/>`,
  laptop: `<path d="M118 96a10 10 0 0 1 10-10h144a10 10 0 0 1 10 10v104H118Z" fill="__DARK__"/><rect x="126" y="94" width="148" height="100" rx="5" fill="__GLASS__"/><rect x="136" y="104" width="82" height="34" rx="4" fill="__LIT__" opacity=".16"/><rect x="136" y="148" width="110" height="4" rx="2" fill="__EDGE__" opacity=".3"/><path d="M92 202h216l16 24a6 6 0 0 1-5 9H81a6 6 0 0 1-5-9Z" fill="__BASE__"/><path d="M92 202h216l6 9H86Z" fill="__LIT__" opacity=".5"/><rect x="168" y="226" width="64" height="4" rx="2" fill="__DEEP__" opacity=".5"/>`,
  light: `<circle cx="200" cy="168" r="92" fill="none" stroke="__BASE__" stroke-width="26"/><circle cx="200" cy="168" r="92" fill="none" stroke="__GLOW__" stroke-width="9" opacity=".55"/><path d="M200 260v52" stroke="__DARK__" stroke-width="14" stroke-linecap="round"/><path d="M156 314h88" stroke="__DARK__" stroke-width="14" stroke-linecap="round"/>`,
  mic: `<rect x="176" y="68" width="48" height="116" rx="24" fill="__BASE__"/><rect x="184" y="84" width="32" height="6" rx="3" fill="__DEEP__" opacity=".3"/><rect x="184" y="100" width="32" height="6" rx="3" fill="__DEEP__" opacity=".3"/><rect x="184" y="116" width="32" height="6" rx="3" fill="__DEEP__" opacity=".3"/><rect x="184" y="132" width="32" height="6" rx="3" fill="__DEEP__" opacity=".3"/><rect x="184" y="148" width="32" height="6" rx="3" fill="__DEEP__" opacity=".3"/><rect x="184" y="164" width="32" height="6" rx="3" fill="__DEEP__" opacity=".3"/><path d="M152 156a48 48 0 0 0 96 0" fill="none" stroke="__LIT__" stroke-width="11" stroke-linecap="round"/><path d="M200 204v54" stroke="__BASE__" stroke-width="12" stroke-linecap="round"/><rect x="158" y="258" width="84" height="16" rx="8" fill="__DARK__"/>`,
  mount: `<circle cx="200" cy="158" r="62" fill="__DARK__"/><circle cx="200" cy="158" r="54" fill="__BASE__"/><circle cx="200" cy="158" r="26" fill="__LIT__" opacity=".4"/><path d="M200 212v52" stroke="__BASE__" stroke-width="16" stroke-linecap="round"/><path d="M150 268h100a12 12 0 0 1 0 24H150a12 12 0 0 1 0-24Z" fill="__DARK__"/>`,
  mouse: `<path d="M200 108c34 0 52 26 52 62v46c0 32-22 52-52 52s-52-20-52-52v-46c0-36 18-62 52-62Z" fill="__BASE__"/><path d="M200 108c34 0 52 26 52 62v10H148v-10c0-36 18-62 52-62Z" fill="__LIT__" opacity=".45"/><rect x="197" y="124" width="6" height="34" rx="3" fill="__DEEP__" opacity=".4"/>`,
  pencil: `<path d="M186 62h28v232l-14 30-14-30Z" fill="__BASE__"/><path d="M186 62h11v232l-11 24Z" fill="__LIT__" opacity=".5"/><rect x="186" y="118" width="28" height="9" rx="2" fill="__DEEP__" opacity=".35"/><path d="M193 296h14l-7 16Z" fill="__DEEP__"/>`,
  phone: `<rect x="148" y="62" width="104" height="210" rx="20" fill="__DARK__"/><rect x="152" y="66" width="96" height="202" rx="17" fill="__BASE__"/><rect x="160" y="76" width="80" height="168" rx="11" fill="__GLASS__"/><rect x="166" y="84" width="30" height="5" rx="2.5" fill="__EDGE__" opacity=".55"/><rect x="170" y="88" width="62" height="44" rx="8" fill="__LIT__" opacity=".18"/><rect x="168" y="250" width="64" height="5" rx="2.5" fill="__EDGE__" opacity=".5"/><rect x="252" y="108" width="3" height="26" rx="1.5" fill="__EDGE__" opacity=".7"/>`,
  psu: `<rect x="134" y="122" width="132" height="132" rx="26" fill="__DARK__"/><rect x="138" y="126" width="124" height="124" rx="23" fill="__BASE__"/><rect x="138" y="126" width="124" height="40" rx="23" fill="__LIT__" opacity=".3"/><rect x="170" y="78" width="12" height="46" rx="5" fill="__EDGE__"/><rect x="218" y="78" width="12" height="46" rx="5" fill="__EDGE__"/><rect x="176" y="216" width="48" height="8" rx="4" fill="__DEEP__" opacity=".35"/>`,
  puck: `<circle cx="200" cy="190" r="78" fill="__DARK__"/><circle cx="200" cy="190" r="70" fill="__BASE__"/><circle cx="200" cy="190" r="48" fill="__LIT__" opacity=".35"/><circle cx="200" cy="190" r="20" fill="__GLOW__" opacity=".45"/><path d="M200 260v54" stroke="__BASE__" stroke-width="12" stroke-linecap="round"/>`,
  remote: `<rect x="166" y="62" width="68" height="216" rx="22" fill="__DARK__"/><rect x="170" y="66" width="60" height="208" rx="19" fill="__BASE__"/><circle cx="200" cy="116" r="30" fill="__DEEP__" opacity=".45"/><circle cx="200" cy="116" r="16" fill="__LIT__" opacity=".6"/><rect x="182" y="168" width="36" height="12" rx="6" fill="__DEEP__" opacity=".35"/><rect x="182" y="194" width="36" height="12" rx="6" fill="__DEEP__" opacity=".35"/><rect x="182" y="220" width="36" height="12" rx="6" fill="__DEEP__" opacity=".35"/><rect x="182" y="246" width="36" height="12" rx="6" fill="__DEEP__" opacity=".35"/>`,
  speaker: `<path d="M136 130h128l-10 132a14 14 0 0 1-14 12H160a14 14 0 0 1-14-12Z" fill="__BASE__"/><ellipse cx="200" cy="130" rx="64" ry="20" fill="__LIT__"/><ellipse cx="200" cy="130" rx="44" ry="13" fill="__GLASS__" opacity=".5"/><path d="M152 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M164 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M176 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M188 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M200 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M212 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M224 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M236 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><path d="M248 158v96" stroke="__DEEP__" stroke-width="3" stroke-linecap="round" opacity=".22"/><rect x="170" y="254" width="60" height="6" rx="3" fill="__GLOW__" opacity=".35"/>`,
  stand: `<path d="M118 274h164a10 10 0 0 1 0 20H118a10 10 0 0 1 0-20Z" fill="__DARK__"/><path d="M182 150h36l-8 124h-20Z" fill="__BASE__"/><path d="M182 150h15l-6 124h-9Z" fill="__LIT__" opacity=".45"/><path d="M126 108a12 12 0 0 1 12-12h124a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H138a12 12 0 0 1-12-12Z" fill="__DARK__"/><rect x="132" y="102" width="136" height="42" rx="9" fill="__BASE__"/><rect x="132" y="102" width="136" height="15" rx="9" fill="__LIT__" opacity=".4"/>`,
  streamer: `<rect x="114" y="140" width="172" height="104" rx="20" fill="__DEEP__" opacity=".45"/><rect x="118" y="134" width="164" height="100" rx="18" fill="__DARK__"/><rect x="122" y="138" width="156" height="92" rx="15" fill="__BASE__"/><rect x="122" y="138" width="156" height="32" rx="15" fill="__LIT__" opacity=".38"/><rect x="144" y="178" width="112" height="6" rx="3" fill="__DEEP__" opacity=".3"/><rect x="144" y="194" width="76" height="6" rx="3" fill="__DEEP__" opacity=".2"/><circle cx="256" cy="212" r="6" fill="__GLOW__" opacity=".75"/>`,
  tablet: `<rect x="112" y="68" width="176" height="200" rx="18" fill="__DARK__"/><rect x="116" y="72" width="168" height="192" rx="15" fill="__BASE__"/><rect x="128" y="84" width="144" height="168" rx="8" fill="__GLASS__"/><rect x="138" y="96" width="92" height="58" rx="6" fill="__LIT__" opacity=".16"/><rect x="138" y="168" width="124" height="4" rx="2" fill="__EDGE__" opacity=".35"/><rect x="138" y="182" width="96" height="4" rx="2" fill="__EDGE__" opacity=".25"/><rect x="288" y="100" width="4" height="30" rx="2" fill="__EDGE__" opacity=".6"/>`,
  tag: `<circle cx="200" cy="186" r="74" fill="__DARK__"/><circle cx="200" cy="186" r="66" fill="__BASE__"/><circle cx="200" cy="186" r="66" fill="none" stroke="__EDGE__" stroke-width="3" opacity=".6"/><circle cx="200" cy="186" r="30" fill="__LIT__" opacity=".4"/><path d="M200 112a74 74 0 0 1 62 34" fill="none" stroke="__GLOW__" stroke-width="6" stroke-linecap="round" opacity=".5"/>`,
  trackpad: `<rect x="96" y="132" width="208" height="136" rx="18" fill="__DARK__"/><rect x="100" y="136" width="200" height="128" rx="15" fill="__BASE__"/><rect x="110" y="146" width="180" height="108" rx="10" fill="__LIT__" opacity=".22"/>`,
  watch: `<rect x="178" y="52" width="44" height="66" rx="14" fill="__DEEP__" opacity=".55"/><rect x="178" y="224" width="44" height="66" rx="14" fill="__DEEP__" opacity=".55"/><rect x="152" y="108" width="96" height="116" rx="30" fill="__DARK__"/><rect x="157" y="113" width="86" height="106" rx="26" fill="__BASE__"/><rect x="165" y="121" width="70" height="90" rx="20" fill="__GLASS__"/><rect x="175" y="134" width="50" height="8" rx="4" fill="__EDGE__" opacity=".65"/><rect x="175" y="150" width="34" height="8" rx="4" fill="__EDGE__" opacity=".4"/><rect x="175" y="172" width="44" height="20" rx="6" fill="__LIT__" opacity=".2"/><rect x="246" y="142" width="5" height="20" rx="2.5" fill="__EDGE__" opacity=".7"/>`,
};

const FALLBACK = 'puck';

/**
 * Render a hardware archetype as an inline SVG string.
 * @param {string} device  key from SHAPES
 * @param {string} color   finish hex, e.g. '#4A5A6E'
 * @param {object} [opts]  { className, ariaLabel }
 */
export function deviceSVG(device, color = '#8C949C', opts = {}) {
  const shape = SHAPES[device] || SHAPES[FALLBACK];
  const f = faces(color);
  const body = shape.replace(/__([A-Z]+)__/g, (m, k) => f[k] ?? color);
  const id = nextId();
  const cls = opts.className ? ` class="${opts.className}"` : '';
  const label = opts.ariaLabel
    ? ` role="img" aria-label="${String(opts.ariaLabel).replace(/"/g, '&quot;')}"`
    : ' aria-hidden="true"';
  return `<svg${cls} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"${label}>
    <defs><radialGradient id="${id}-amb" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="${f.LIT}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${f.BASE}" stop-opacity="0"/>
    </radialGradient></defs>
    <circle cx="200" cy="176" r="168" fill="url(#${id}-amb)"/>
    <ellipse cx="200" cy="330" rx="104" ry="15" fill="${f.DEEP}" opacity=".22"/>
    ${body}
  </svg>`;
}

export const DEVICE_KEYS = Object.keys(SHAPES);

