/* ==========================================================================
   iLand — store
   The single source of truth for the whole demo. Seeds from seed.js on first
   run, then persists to localStorage. The admin panel writes here; the
   storefront reads here; both listen for changes. Edits made in /admin.html
   show up on the storefront immediately — including in another open tab,
   via the `storage` event.
   ========================================================================== */

import { SITE, CATEGORIES, PRODUCTS, SERVICES, BANNERS, PROMOS, INSTALMENTS, SETTINGS, ACCESSORY_GROUPS, FINISHES } from './seed.js';

const KEY = 'iland.cms.v1';
const CART_KEY = 'iland.cart.v1';
const PREF_KEY = 'iland.pref.v1';

/* ------------------------------------------------------------------ state */

function factory() {
  return {
    version: 1,
    site: structuredClone(SITE),
    categories: structuredClone(CATEGORIES),
    products: structuredClone(PRODUCTS),
    services: structuredClone(SERVICES),
    banners: structuredClone(BANNERS),
    promos: structuredClone(PROMOS),
    instalments: structuredClone(INSTALMENTS),
    settings: structuredClone(SETTINGS),
    orders: seedOrders(),
  };
}

/* A few plausible orders so the admin dashboard isn't an empty shell. */
function seedOrders() {
  const rows = [
    ['1042', 'ნ. გამყრელიძე', 'iphone-17-pro', 1, 3199, 'new',       '2026-07-28'],
    ['1041', 'T. Beridze',     'macbook-air-15', 1, 2649, 'packing',  '2026-07-28'],
    ['1040', 'ლ. კვარაცხელია', 'airpods-pro-3', 2, 1498, 'shipped',  '2026-07-27'],
    ['1039', 'M. Jorbenadze',  'watch-ultra-3',  1, 2449, 'done',     '2026-07-27'],
    ['1038', 'ს. მაისურაძე',   'ipad-air-m3',    1, 1849, 'done',     '2026-07-26'],
    ['1037', 'G. Tsiklauri',   'iphone-15',      1, 1369, 'done',     '2026-07-26'],
    ['1036', 'ა. ნოზაძე',      'mac-mini-m4',    1, 1699, 'cancelled','2026-07-25'],
  ];
  return rows.map(([id, customer, product, qty, total, status, date]) =>
    ({ id, customer, product, qty, total, status, date }));
}

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return factory();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return factory();
    return parsed;
  } catch {
    return factory();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('iLand: could not persist CMS state', e);
  }
}

function emit(reason) {
  for (const fn of listeners) {
    try { fn(state, reason); } catch (e) { console.error(e); }
  }
}

/** Subscribe to any CMS change. Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* Cross-tab: admin in one tab updates the storefront in another. */
addEventListener('storage', e => {
  if (e.key !== KEY) return;
  state = load();
  emit('external');
});

export const getState = () => state;

/** Mutate state through a callback, then persist + notify. */
export function update(mutator, reason = 'update') {
  const draft = structuredClone(state);
  const out = mutator(draft);
  state = out === undefined ? draft : out;
  persist();
  emit(reason);
  return state;
}

/** Nuke local edits and go back to the shipped catalogue. */
export function resetToFactory() {
  state = factory();
  persist();
  emit('reset');
  return state;
}

/** Export the whole CMS as a JSON string — the "publish" artefact. */
export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

/** Import a previously exported CMS payload. Returns {ok, error}. */
export function importJSON(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.products)) {
      return { ok: false, error: 'Not an iLand CMS export — missing products array.' };
    }
    state = { ...factory(), ...parsed, version: 1 };
    persist();
    emit('import');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/* --------------------------------------------------------------- pricing */

const today = () => new Date().toISOString().slice(0, 10);

/** Promos that are active AND inside their date window right now. */
export function livePromos(s = state) {
  const d = today();
  return (s.promos || []).filter(p => p.active && (!p.starts || p.starts <= d) && (!p.ends || p.ends >= d));
}

function promoApplies(promo, product) {
  if (promo.scope === 'all') return true;
  if (promo.scope === 'category') return product.category === promo.target;
  if (promo.scope === 'product') return product.id === promo.target;
  return false;
}

/**
 * Resolve the price a shopper actually sees.
 * Returns { base, final, was, off, promo } — `was` is the strike-through price
 * (null when there is nothing to strike through, which is the bug the old site
 * had: it printed a struck-through 0₾ on every accessory).
 */
export function priceOf(product, s = state) {
  const base = Number(product.price) || 0;
  let final = base;
  let promo = null;

  for (const p of livePromos(s)) {
    if (!promoApplies(p, product)) continue;
    const candidate = p.type === 'percent'
      ? base * (1 - Number(p.value) / 100)
      : base - Number(p.value);
    if (candidate < final) { final = candidate; promo = p; }
  }

  final = Math.max(0, Math.round(final));
  const listWas = Number(product.oldPrice) || 0;
  const was = final < base ? base : (listWas > base ? listWas : null);
  const off = was ? Math.round((1 - final / was) * 100) : 0;

  return { base, final, was, off, promo };
}

/** Monthly instalment, the way Georgian retail quotes it. */
export function monthly(amount, months = 12, partner) {
  const p = partner || (state.instalments || [])[0] || { rate: 0 };
  const withRate = amount * (1 + (Number(p.rate) || 0));
  return Math.ceil(withRate / months);
}

/** Price with a storage tier and its delta applied. */
export function variantPrice(product, storageSize, s = state) {
  const tier = (product.storage || []).find(t => t.size === storageSize);
  const delta = tier ? Number(tier.delta) || 0 : 0;
  const priced = priceOf({ ...product, price: product.price + delta }, s);
  return priced;
}

/* --------------------------------------------------------------- queries */

export const byId = id => state.products.find(p => p.id === id) || null;

export function inCategory(catId, s = state) {
  return s.products.filter(p => p.category === catId);
}

export function featured(s = state) {
  const f = s.products.filter(p => p.featured);
  return f.length ? f : s.products.slice(0, 6);
}

export function onSale(s = state) {
  return s.products
    .map(p => ({ p, price: priceOf(p, s) }))
    .filter(x => x.price.was && x.price.off > 0)
    .sort((a, b) => b.price.off - a.price.off)
    .map(x => x.p);
}

export function activeBanners(s = state) {
  return (s.banners || []).filter(b => b.active).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function search(q, s = state) {
  const needle = String(q || '').trim().toLowerCase();
  if (!needle) return [];
  return s.products.filter(p => {
    const hay = [
      p.name, p.sku, p.category, p.group,
      p.tagline?.ka, p.tagline?.en, p.tagline?.ru,
      ...(p.specs || []).map(x => x.v),
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(needle);
  }).slice(0, 8);
}

/** Stock label, matching the phrasing the shop already uses. */
export function stockState(product) {
  const n = Number(product.stock) || 0;
  if (n <= 0) return { key: 'out',  ka: 'არ არის მარაგში', en: 'Out of stock',  ru: 'Нет в наличии' };
  if (n === 1) return { key: 'last', ka: 'ბოლო ცალია',      en: 'Last one',      ru: 'Последний' };
  if (n <= 5)  return { key: 'low',  ka: 'მცირე მარაგი',    en: 'Low stock',     ru: 'Мало осталось' };
  return { key: 'in', ka: 'მარაგშია', en: 'In stock', ru: 'В наличии' };
}

/* ------------------------------------------------------------------ cart */

let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  emit('cart');
}

export const getCart = () => cart;
export const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
export const cartTotal = () => cart.reduce((n, l) => n + l.price * l.qty, 0);

export function addToCart(productId, { storage, color, qty = 1 } = {}) {
  const p = byId(productId);
  if (!p) return;
  const size = storage || p.storage?.[0]?.size || '—';
  const finish = color || p.colors?.[0]?.id || null;
  const price = variantPrice(p, size).final;
  const key = `${productId}|${size}|${finish}`;
  const line = cart.find(l => l.key === key);
  if (line) line.qty += qty;
  else cart.push({ key, id: productId, name: p.name, device: p.device, storage: size, color: finish, price, qty });
  saveCart();
  return cartCount();
}

export function setQty(key, qty) {
  const line = cart.find(l => l.key === key);
  if (!line) return;
  line.qty = Math.max(0, qty);
  if (line.qty === 0) cart = cart.filter(l => l.key !== key);
  saveCart();
}

export function removeFromCart(key) {
  cart = cart.filter(l => l.key !== key);
  saveCart();
}

export function clearCart() { cart = []; saveCart(); }

/* ------------------------------------------------------- language & theme */

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; }
}
let prefs = loadPrefs();

export const LANGS = ['ka', 'en', 'ru'];
export const getLang = () => (LANGS.includes(prefs.lang) ? prefs.lang : 'ka');
export const getTheme = () => (prefs.theme === 'light' ? 'light' : 'dark');

export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  prefs = { ...prefs, lang };
  try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch {}
  emit('lang');
}

export function setTheme(theme) {
  prefs = { ...prefs, theme: theme === 'light' ? 'light' : 'dark' };
  try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch {}
  emit('theme');
}

/** Pick a localised string from a {ka,en,ru} bag, falling back sensibly. */
export function t(bag, lang = getLang()) {
  if (bag == null) return '';
  if (typeof bag === 'string') return bag;
  return bag[lang] ?? bag.ka ?? bag.en ?? bag.ru ?? '';
}

/** Format a number as Georgian lari. */
export function gel(n, { symbol = true } = {}) {
  const v = Math.round(Number(n) || 0).toLocaleString('en-US');
  return symbol ? `${v}₾` : v;
}

export { ACCESSORY_GROUPS, FINISHES };
