/* ==========================================================================
   iLand — WebGL fluid background
   A GPU stable-fluids solver (Stam 1999, Harris GPU Gems 38) writing dye into
   a full-viewport canvas that sits behind the DOM.

   Written rather than vendored because the choreography needs to drive it:
   `plume()` fires an upward burst of colour at an arbitrary screen point, which
   is what makes a landing product card look like it displaced the ground.

   Pipeline per frame:
     curl -> vorticity -> divergence -> decay pressure -> N x Jacobi pressure
     -> gradient subtract -> advect velocity -> advect dye -> display

   Everything degrades: no WebGL2, no half-float render target, no linear
   filtering of float textures, reduced-motion, or a hidden tab all have a
   defined behaviour. `supported === false` means the caller should keep its CSS
   background and never call anything else.
   ========================================================================== */

/* ------------------------------------------------------------------ shaders */

const VERT = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const F_COPY = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
void main () { gl_FragColor = texture2D(uTexture, vUv); }`;

/* Pressure is decayed rather than hard-cleared: a little carry-over between
   frames converges faster than starting from zero every time. */
const F_CLEAR = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const F_SPLAT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;                       /* keep the blob round, not oval */
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

/* MANUAL_FILTERING is prepended when the platform cannot linearly filter the
   float textures — without it advection lands on texel centres and the whole
   sim goes blocky. */
const F_ADVECT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
#else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
#endif
  float decay = 1.0 + dissipation * dt;
  result /= decay;
#ifdef ZERO_FLOOR
  /* Half-float division is asymptotic: dye parks around 1e-4 and never reaches
     zero, leaving a permanent haze over the whole ground. Subtract an absolute
     floor — dye pass only, never velocity, where it would kill slow currents. */
  result = max(result - 3.5e-4, 0.0);
#endif
  gl_FragColor = result;
}`;

const F_DIVERGENCE = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  /* Reflect at the walls so the fluid does not leak off the edges. */
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const F_CURL = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

/* Vorticity confinement puts back the small swirls that advection smears out.
   Without it the fluid looks like spreading ink; with it, like moving water. */
const F_VORTICITY = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;

  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel += force * dt;
  vel = min(max(vel, -1000.0), 1000.0);   /* hard clamp: one NaN here and the
                                             whole field is dead for good */
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`;

const F_PRESSURE = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const F_GRADIENT = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

/* Opaque, with the ground colour baked in and alpha always 1.0.
   Compositing the canvas over CSS with a non-premultiplied alpha is a whole
   family of bugs for no benefit — this way dye 0 maps to exactly the abyss
   ground, so "the ground stays dark" is true by construction. */
const F_DISPLAY = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform vec3 uGround;
void main () {
  vec3 dye = texture2D(uTexture, vUv).rgb * uIntensity;
  /* Screen-blend the dye over the ground: keeps highlights from clipping to
     flat white the way plain addition does. */
  vec3 c = 1.0 - (1.0 - uGround) * (1.0 - clamp(dye, 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}`;

/* ---------------------------------------------------------------- utilities */

function compile(gl, type, source, defines = '') {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, defines + source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('iLand fluid: shader compile failed\n', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  /* Must precede linkProgram — the single quad is bound at location 0 and we
     never query the attribute location again. */
  gl.bindAttribLocation(p, 0, 'aPosition');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn('iLand fluid: program link failed\n', gl.getProgramInfoLog(p));
    return null;
  }
  const uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i).name;
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  return { program: p, uniforms };
}

/** #rrggbb -> [r,g,b] in 0..1 */
export function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [
    parseInt(s.slice(0, 2), 16) / 255,
    parseInt(s.slice(2, 4), 16) / 255,
    parseInt(s.slice(4, 6), 16) / 255,
  ];
}

/* ------------------------------------------------------------------- config */

/* densityDissipation is a decay RATE: decay = 1 + dissipation*dt, so smaller
   numbers keep dye on screen longer. These are tuned so the field always holds
   visible colour without the pointer, but never so much that text over it
   stops being readable. */
/* Tuning notes, because these interact and are easy to flail at:
   - timeScale slows the whole simulation without changing its shape. It is the
     "slower" dial; lowering forces instead makes it weaker, not slower.
   - curl is vorticity confinement, i.e. the turbulence dial. High values put
     back the small eddies advection smears out, which reads as chaotic; low
     values give long smooth currents. This is the "less chaotic" dial.
   - splatRadius is the "smaller" dial: the size of each injected blob.
   - velocityDissipation damps motion over time. Too high and the field goes
     static and the dye just sits there. */
const DESKTOP = {
  simRes: 128, dyeRes: 1024, pressureIters: 20,
  velocityDissipation: 0.4, densityDissipation: 0.085, curl: 9,
  splatRadius: 0.14, splatForce: 3000, intensity: 1.45, maxDpr: 1.5,
  ambient: 2.0,           /* emitters per second, 0 disables */
  timeScale: 0.5,
};
const MOBILE = {
  simRes: 96, dyeRes: 512, pressureIters: 12,
  velocityDissipation: 0.45, densityDissipation: 0.12, curl: 7,
  splatRadius: 0.17, splatForce: 2600, intensity: 1.35, maxDpr: 1,
  ambient: 1.5,
  timeScale: 0.5,
};

/**
 * Mount a fluid simulation on a canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {object} [opts] palette: string[] of hex, plus any config override
 * @returns {object} { supported, splat, plume, pointerAt, resize, pause, resume, destroy, config }
 */
export function createFluid(canvas, opts = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return { supported: false, reason: 'prefers-reduced-motion' };

  /* alpha:false — the display pass bakes the ground colour in and always writes
     alpha 1.0, so the canvas is opaque and there is nothing to composite. */
  const params = { alpha: false, depth: false, stencil: false, antialias: false,
                   premultipliedAlpha: false, preserveDrawingBuffer: false,
                   powerPreference: 'high-performance' };

  let gl = canvas.getContext('webgl2', params);
  const isWebGL2 = !!gl;
  if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
  if (!gl) return { supported: false, reason: 'no-webgl' };

  /* --- texture formats. Half-float is the floor; below that the sim looks
         wrong rather than merely coarse, so we decline instead. --- */
  let halfFloat, supportLinear, formatRGBA, formatRG, formatR;

  const supportsFormat = (internal, format, type) => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    gl.deleteTexture(tex);
    return ok;
  };

  if (isWebGL2) {
    gl.getExtension('EXT_color_buffer_float');
    supportLinear = !!gl.getExtension('OES_texture_float_linear') || true; /* half-float linear is core in WebGL2 */
    halfFloat = gl.HALF_FLOAT;
    formatRGBA = { internal: gl.RGBA16F, format: gl.RGBA };
    formatRG   = { internal: gl.RG16F,   format: gl.RG };
    formatR    = { internal: gl.R16F,    format: gl.RED };
    if (!supportsFormat(formatRGBA.internal, formatRGBA.format, halfFloat)) {
      return { supported: false, reason: 'no-float-render-target' };
    }
    /* Some drivers expose RGBA16F but not RG16F/R16F — collapse to RGBA. */
    if (!supportsFormat(formatRG.internal, formatRG.format, halfFloat)) formatRG = formatRGBA;
    if (!supportsFormat(formatR.internal, formatR.format, halfFloat))   formatR  = formatRGBA;
  } else {
    const hf = gl.getExtension('OES_texture_half_float');
    if (!hf) return { supported: false, reason: 'no-half-float' };
    supportLinear = !!gl.getExtension('OES_texture_half_float_linear');
    halfFloat = hf.HALF_FLOAT_OES;
    formatRGBA = { internal: gl.RGBA, format: gl.RGBA };
    formatRG = formatRGBA;
    formatR = formatRGBA;
    if (!supportsFormat(formatRGBA.internal, formatRGBA.format, halfFloat)) {
      return { supported: false, reason: 'no-half-float-render-target' };
    }
  }

  /* Tier on viewport width and core count, not on pointer type: a coarse
     pointer is a touchscreen, which says nothing useful about the GPU, and it
     wrongly demotes touch laptops and dev preview panes. */
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
  const isMobile = innerWidth < 820 || lowPower;
  const cfg = { ...(isMobile ? MOBILE : DESKTOP), ...opts };
  const palette = (opts.palette || ['#2FD6B4', '#FF9F45', '#7FEFD8']).map(hexToRgb);
  const ground = hexToRgb(opts.ground || '#04070C');

  /* --- geometry: one full-screen triangle pair, drawn for every pass --- */
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const idx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  if (!vs) return { supported: false, reason: 'vertex-shader' };
  const defines = supportLinear ? '' : '#define MANUAL_FILTERING\n';

  const mk = (src, def = '') => {
    const fs = compile(gl, gl.FRAGMENT_SHADER, src, def);
    return fs ? program(gl, vs, fs) : null;
  };

  const P = {
    copy:      mk(F_COPY),
    clear:     mk(F_CLEAR),
    splat:     mk(F_SPLAT),
    /* Two advection variants from one source: the dye pass gets the zero floor,
       the velocity pass must not have it. */
    advectVel: mk(F_ADVECT, defines),
    advectDye: mk(F_ADVECT, defines + '#define ZERO_FLOOR\n'),
    divergence:mk(F_DIVERGENCE),
    curl:      mk(F_CURL),
    vorticity: mk(F_VORTICITY),
    pressure:  mk(F_PRESSURE),
    gradient:  mk(F_GRADIENT),
    display:   mk(F_DISPLAY),
  };
  for (const k in P) if (!P[k]) return { supported: false, reason: `program:${k}` };

  /* ----------------------------------------------------------- framebuffers */

  function makeFBO(w, h, fmt, type, filter) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    /* CLAMP_TO_EDGE, always — REPEAT makes the fluid wrap around the screen. */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, fmt.format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture: tex, fbo, width: w, height: h,
      texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; },
    };
  }

  function makeDouble(w, h, fmt, type, filter) {
    let a = makeFBO(w, h, fmt, type, filter);
    let b = makeFBO(w, h, fmt, type, filter);
    return {
      width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      get read() { return a; }, set read(v) { a = v; },
      get write() { return b; }, set write(v) { b = v; },
      swap() { const t = a; a = b; b = t; },
    };
  }

  const filtering = supportLinear ? gl.LINEAR : gl.NEAREST;
  let dye, velocity, divergenceFBO, curlFBO, pressure;
  let simW, simH, dyeW, dyeH;

  function resolution(target) {
    let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (ar < 1) ar = 1 / ar;
    const min = Math.round(target);
    const max = Math.round(target * ar);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min } : { width: min, height: max };
  }

  function initFBOs() {
    const s = resolution(cfg.simRes), d = resolution(cfg.dyeRes);
    simW = s.width; simH = s.height; dyeW = d.width; dyeH = d.height;
    gl.disable(gl.BLEND);
    dye = makeDouble(dyeW, dyeH, formatRGBA, halfFloat, filtering);
    velocity = makeDouble(simW, simH, formatRG, halfFloat, filtering);
    divergenceFBO = makeFBO(simW, simH, formatR, halfFloat, gl.NEAREST);
    curlFBO = makeFBO(simW, simH, formatR, halfFloat, gl.NEAREST);
    pressure = makeDouble(simW, simH, formatR, halfFloat, gl.NEAREST);
  }

  /* --------------------------------------------------------------- plumbing */

  function blit(target) {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
  const use = p => gl.useProgram(p.program);

  let dpr = Math.min(cfg.maxDpr, devicePixelRatio || 1);

  /* Re-allocating every buffer is expensive and visibly pops, so it is driven
     by a ResizeObserver rather than measured each frame, and small height
     changes are ignored: on mobile the collapsing URL bar fires a resize on
     nearly every scroll, which would otherwise reinitialise the whole sim. */
  let pendingW = 0, pendingH = 0, needsResize = false;

  function resize() {
    if (!needsResize) return false;
    needsResize = false;
    const w = Math.round(pendingW * dpr);
    const h = Math.round(pendingH * dpr);
    if (w <= 0 || h <= 0) return false;
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w; canvas.height = h;
    initFBOs();
    return true;
  }

  const ro = new ResizeObserver(entries => {
    const box = entries[0]?.contentRect;
    if (!box) return;
    const w = Math.round(box.width), h = Math.round(box.height);
    if (w <= 0 || h <= 0) return;
    const dw = Math.abs(w - canvas.width / dpr);
    const dh = Math.abs(h - canvas.height / dpr);
    if (dw < 1 && dh < 24) return;      /* URL-bar-sized change: ignore */
    pendingW = w; pendingH = h; needsResize = true;
  });
  ro.observe(canvas);

  canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  initFBOs();

  /* ------------------------------------------------------------------ steps */

  function step(dt) {
    gl.disable(gl.BLEND);

    use(P.curl);
    gl.uniform2f(P.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curlFBO);

    use(P.vorticity);
    gl.uniform2f(P.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.vorticity.uniforms.uCurl, curlFBO.attach(1));
    gl.uniform1f(P.vorticity.uniforms.curl, cfg.curl);
    gl.uniform1f(P.vorticity.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    use(P.divergence);
    gl.uniform2f(P.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergenceFBO);

    use(P.clear);
    gl.uniform1i(P.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(P.clear.uniforms.value, 0.8);
    blit(pressure.write);
    pressure.swap();

    use(P.pressure);
    gl.uniform2f(P.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.pressure.uniforms.uDivergence, divergenceFBO.attach(0));
    for (let i = 0; i < cfg.pressureIters; i++) {
      gl.uniform1i(P.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    use(P.gradient);
    gl.uniform2f(P.gradient.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.gradient.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(P.gradient.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    /* texelSize here is ALWAYS the velocity/sim texel size, in both advection
       passes — velocity is stored in sim grid-cells per second, so the
       backtrace has to be measured on the velocity grid. dyeTexelSize is only
       read by the manual-bilerp path and must match whatever uSource is. */
    use(P.advectVel);
    gl.uniform2f(P.advectVel.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!supportLinear) {
      gl.uniform2f(P.advectVel.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    }
    gl.uniform1i(P.advectVel.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.advectVel.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(P.advectVel.uniforms.dt, dt);
    gl.uniform1f(P.advectVel.uniforms.dissipation, cfg.velocityDissipation);
    blit(velocity.write);
    velocity.swap();

    use(P.advectDye);
    gl.uniform2f(P.advectDye.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!supportLinear) {
      gl.uniform2f(P.advectDye.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    }
    gl.uniform1i(P.advectDye.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.advectDye.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(P.advectDye.uniforms.dt, dt);
    gl.uniform1f(P.advectDye.uniforms.dissipation, cfg.densityDissipation);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    /* No blending anywhere in this renderer: additivity happens in the splat
       shader, and the display pass is opaque. */
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    use(P.display);
    gl.uniform1i(P.display.uniforms.uTexture, dye.read.attach(0));
    gl.uniform1f(P.display.uniforms.uIntensity, cfg.intensity);
    gl.uniform3f(P.display.uniforms.uGround, ground[0], ground[1], ground[2]);
    blit(null);
  }

  /* ------------------------------------------------------------------ splat */

  /**
   * Inject velocity and colour at a point.
   * @param x 0..1 from the LEFT
   * @param y 0..1 from the BOTTOM  (GL convention — see domSplat for DOM coords)
   * @param dx horizontal impulse
   * @param dy vertical impulse (positive = up)
   * @param color [r,g,b] 0..1
   * @param radiusScale multiplier on cfg.splatRadius
   */
  function splat(x, y, dx, dy, color, radiusScale = 1) {
    const ar = canvas.width / canvas.height;
    use(P.splat);
    gl.uniform1i(P.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(P.splat.uniforms.aspectRatio, ar);
    gl.uniform2f(P.splat.uniforms.point, x, y);
    gl.uniform3f(P.splat.uniforms.color, dx, dy, 0);
    gl.uniform1f(P.splat.uniforms.radius, correctRadius(cfg.splatRadius / 100 * radiusScale, ar));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(P.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(P.splat.uniforms.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  function correctRadius(r, ar) { return ar > 1 ? r * ar : r; }

  const rand = () => Math.random();
  /* Weighted, not uniform. Sun is the brand's secondary and reads far stronger
     than Lume against a black ground, so picking evenly makes the background
     look orange. Teal leads; orange is the accent. */
  const PICK_WEIGHTS = opts.weights || [0.62, 0.14, 0.24];
  function pick() {
    let r = rand(), i = 0;
    while (i < palette.length - 1 && r > (PICK_WEIGHTS[i] ?? 0)) { r -= PICK_WEIGHTS[i] ?? 0; i++; }
    return palette[i];
  }

  /**
   * Drag impulse from DOM/pointer coordinates (origin top-left, CSS pixels).
   */
  function pointerAt(clientX, clientY, moveX, moveY) {
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    const y = 1 - (clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const c = pick();
    splat(x, y, moveX * cfg.splatForce / r.width, -moveY * cfg.splatForce / r.height,
          [c[0] * 0.32, c[1] * 0.32, c[2] * 0.32]);
  }

  /* ------------------------------------------------------------ splat queue */

  /* Splats are queued and drained inside the sim's own frame rather than fired
     immediately. Two reasons: a fast scroll can land six cards in one frame and
     36 splats in a single frame is a visible hitch, and beat 2 of the plume has
     to be frame-synced (a setTimeout drifts against the animation under load). */
  const queue = [];
  const MAX_SPLATS_PER_FRAME = 6;

  function drainQueue() {
    let budget = MAX_SPLATS_PER_FRAME;
    for (let i = 0; i < queue.length && budget > 0; ) {
      const s = queue[i];
      if (s.wait > 0) { s.wait--; i++; continue; }
      splat(s.x, s.y, s.dx, s.dy, s.color, s.rs);
      queue.splice(i, 1);
      budget--;
    }
    /* Never let a backlog build: a long fling could otherwise queue faster than
       the budget drains and splash seconds after the card landed. */
    if (queue.length > 48) queue.length = 48;
  }

  const LUME = hexToRgb('#2FD6B4');
  const SUN  = hexToRgb('#FF9F45');

  /** Centre of the plume is Lume, the edges drift toward Sun. */
  function plumeColor(s, spread) {
    const k = Math.min(1, Math.abs(s) * 0.55 + rand() * spread);
    const g = 0.5 + 0.34 * rand();
    return [
      (LUME[0] + (SUN[0] - LUME[0]) * k) * g,
      (LUME[1] + (SUN[1] - LUME[1]) * k) * g,
      (LUME[2] + (SUN[2] - LUME[2]) * k) * g,
    ];
  }

  /**
   * The landing splash: colour flushing up out of the ground where a card hit.
   *
   * A single splat is always a blob — the pressure projection turns one point
   * impulse into a symmetric vortex ring. What reads as an impact is a LINE
   * source across the contact edge, velocity fanned outward from the centre,
   * and two beats in time: a wide lateral spray, then a narrow core a few
   * frames later that punches up through it.
   *
   * @param rect  DOM rect of the thing that landed — needs left/width/bottom
   * @param opts  { energy, count }
   */
  function plumeUnder(rect, opts2 = {}) {
    const vw = canvas.clientWidth || innerWidth;
    const vh = canvas.clientHeight || innerHeight;
    const energy = opts2.energy ?? 1;
    const N = opts2.count ?? (isMobile ? 3 : 5);

    const y0 = 1 - rect.bottom / vh;           /* contact line, fluid space */
    if (y0 < -0.15 || y0 > 1.15) return;

    /* Beat 1 — lateral spray along the contact line. */
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N;
      const s = t * 2 - 1;
      const x = (rect.left + rect.width * t) / vw;
      const up = (0.55 + 0.45 * Math.cos(s * 1.35)) * energy;
      const out = s * 0.85 * energy;
      queue.push({
        wait: 0,
        x: x + (rand() - 0.5) * 0.012,
        y: y0 + 0.010 + (rand() - 0.5) * 0.006,
        dx: out * 520,
        dy: up * 950,                          /* positive = up */
        color: plumeColor(s, 0.35),
        rs: 0.45 + 0.18 * rand(),
      });
    }

    /* Beat 2 — the core column, four frames later. */
    queue.push({
      wait: 4,
      x: (rect.left + rect.width * 0.5) / vw,
      y: y0 + 0.030,
      dx: (rand() - 0.5) * 140,
      dy: 1650 * energy,
      color: plumeColor(0, 0.15),
      rs: 0.34,
    });
  }

  /** Point-source convenience wrapper, for anything without a rect. */
  function plume(clientX, clientY, opts2 = {}) {
    const w = (opts2.width ?? 220);
    plumeUnder({ left: clientX - w / 2, width: w, bottom: clientY }, opts2);
  }

  /* ------------------------------------------------------------------- loop */

  let last = performance.now();
  let raf = 0;
  let running = false;

  /* Ambient emitters. Without them the dye decays to black within a couple of
     seconds of the last pointer move and the "fluid background" becomes a black
     rectangle. Emitters drift along a slow Lissajous path so the motion never
     reads as a repeating loop. */
  let ambientAccum = 0;
  let ambientPhase = rand() * 1000;

  function ambientStep(dt) {
    if (!cfg.ambient) return;
    ambientAccum += dt * cfg.ambient;
    if (ambientAccum < 1) return;
    ambientAccum -= 1;
    ambientPhase += 0.7;
    /* Scattered across the whole viewport rather than along a path. At this
       speed the fluid barely carries dye away from where it lands, so a path
       would pool in one region and leave the rest of the screen black. The
       wander is kept as a bias so placement is not uniformly random either. */
    const bx = 0.5 + 0.30 * Math.sin(ambientPhase * 0.31);
    const by = 0.5 + 0.26 * Math.sin(ambientPhase * 0.47 + 1.3);
    const x = Math.min(0.96, Math.max(0.04, bx + (rand() - 0.5) * 0.85));
    const y = Math.min(0.96, Math.max(0.04, by + (rand() - 0.5) * 0.8));
    const c = pick();
    const dir = ambientPhase % 2 < 1 ? 1 : -1;
    splat(x, y,
          dir * (220 + rand() * 300),
          (rand() - 0.4) * 320,
          [c[0] * 0.55, c[1] * 0.55, c[2] * 0.55],
          1.5);
  }

  function frame(now) {
    if (!running) return;
    let dt = (now - last) / 1000;
    /* Cap dt: after a background tab or a long jank the elapsed time is huge
       and a single giant advection step tears the field apart. */
    dt = Math.min(dt, 1 / 30);
    last = now;
    resize();
    ambientStep(dt);          /* emitter rate stays on real time */
    drainQueue();
    step(dt * cfg.timeScale); /* physics runs slow */
    render();
    raf = requestAnimationFrame(frame);
  }

  function resume() {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  /** Advance one frame synchronously. The loop is rAF-driven, so this exists
      for tests and for anything that needs a frame without a live loop. */
  function tick(dt = 1 / 60) {
    resize();
    ambientStep(Math.min(dt, 1 / 30));
    drainQueue();
    step(Math.min(dt, 1 / 30) * cfg.timeScale);
    render();
  }
  function pause() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /* Safari sometimes throttles rather than stops rAF in a hidden tab, so the
     timestamp is reset on return rather than trusted. */
  const onVisibility = () => {
    if (document.hidden) { pause(); return; }
    last = performance.now();
    resume();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onLost = e => { e.preventDefault(); pause(); };
  canvas.addEventListener('webglcontextlost', onLost);

  function destroy() {
    pause();
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onLost);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }

  /** Seed the field so the page never opens on an empty black canvas. */
  function seed(n = 6) {
    for (let i = 0; i < n; i++) {
      const c = pick();
      splat(rand(), rand(), (rand() - 0.5) * 620, (rand() - 0.5) * 620,
            [c[0] * 0.8, c[1] * 0.8, c[2] * 0.8], 1.35);
    }
  }

  resume();

  return {
    supported: true, isWebGL2, supportLinear, config: cfg,
    splat, plume, plumeUnder, pointerAt, resize, pause, resume, destroy, seed, tick,
    get running() { return running; },
    stats: () => ({ simW, simH, dyeW, dyeH, dpr, queued: queue.length }),
  };
}
