/* ==========================================================================
   NORVA — store
   The single source of truth for the whole demo. The admin panel writes here;
   the storefront reads here; both listen for changes.

   THE CATALOGUE AND THE CART ARE HELD IN MEMORY AND NOWHERE ELSE.

   That is the whole persistence design, and it is deliberate. A refresh is the
   reset: reload the page and you are back to the shipped catalogue, whatever
   the last visitor did to it. Nothing survives the tab, nothing is inherited by
   the next person on a shared machine, and there is no stale blob to migrate
   when the fixtures change. The reset control in the demo banner does the same
   thing without losing your scroll position.

   Only genuine viewer preferences — language and theme — are written to
   sessionStorage, because resetting those on every refresh would be hostile
   rather than clean.

   Cross-tab sync (open the storefront and the CMS side by side and watch a
   price change land) rides on a BroadcastChannel, which needs no storage at
   all: the state travels directly from the tab that changed it.
   ========================================================================== */

import { SITE, CATEGORIES, PRODUCTS, SERVICES, BANNERS, PROMOS, INSTALMENTS, SETTINGS, ORDERS, ACCESSORY_GROUPS, FINISHES } from './seed.js';

const PREF_KEY = 'nv.demo.pref.v1';
const CHANNEL = 'nv.demo.sync.v1';

/* Preferences only. Guarded at every call site — it throws in some privacy modes. */
const prefStore = () => sessionStorage;

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
    orders: structuredClone(ORDERS),
  };
}

/* Every page load starts from the shipped catalogue. This is the reset. */
let state = factory();
const listeners = new Set();

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

/* Cross-tab: an edit in the CMS tab lands live in the storefront tab. The state
   travels over the channel itself, so nothing has to be stored to share it.
   Absent in very old browsers, where tabs simply stay independent.

   A tab opened later starts from the factory catalogue rather than adopting
   whatever a sibling tab has already edited — deliberately, because "reload to
   reset" has to stay true whether or not another tab happens to be open. */
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL) : null;
let muted = false;

if (channel) {
  channel.onmessage = e => {
    if (!e.data || e.data.channel !== CHANNEL) return;
    muted = true;
    state = e.data.state;
    muted = false;
    emit('external');
  };
}

function broadcast() {
  if (!channel || muted) return;
  try { channel.postMessage({ channel: CHANNEL, state }); } catch {}
}

export const getState = () => state;

/** Mutate state through a callback, then persist + notify. */
export function update(mutator, reason = 'update') {
  const draft = structuredClone(state);
  const out = mutator(draft);
  state = out === undefined ? draft : out;
  broadcast();
  emit(reason);
  return state;
}

/** Nuke local edits and go back to the shipped catalogue — a reload without
    the reload, for a visitor who has edited the demo into a corner. */
export function resetToFactory() {
  state = factory();
  cart = [];
  broadcast();
  emit('reset');
  emit('cart');
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
      return { ok: false, error: 'Not a NORVA CMS export — missing products array.' };
    }
    state = { ...factory(), ...parsed, version: 1 };
    broadcast();
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
 * Returns { base, final, was, off, promo } — `was` is the strike-through price,
 * and it is null when there is nothing genuinely higher to strike through, so a
 * full-price item never shows a fake discount.
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

/** Monthly instalment, quoted the way this market quotes it. */
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

/** Stock label. Four states, and the fixtures exercise all four. */
export function stockState(product) {
  const n = Number(product.stock) || 0;
  if (n <= 0) return { key: 'out',  ka: 'არ არის მარაგში', en: 'Out of stock',  ru: 'Нет в наличии' };
  if (n === 1) return { key: 'last', ka: 'ბოლო ცალია',      en: 'Last one',      ru: 'Последний' };
  if (n <= 5)  return { key: 'low',  ka: 'მცირე მარაგი',    en: 'Low stock',     ru: 'Мало осталось' };
  return { key: 'in', ka: 'მარაგშია', en: 'In stock', ru: 'В наличии' };
}

/* ------------------------------------------------------------------ cart */

/* In memory with the catalogue, and for the same reason: a reload is the reset. */
let cart = [];

function saveCart() {
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

/**
 * Turn the current cart into an order and put it at the top of the CMS list.
 * This is the whole of "checkout" in a demo: no payment, no address, no email —
 * but the order really is created, really is numbered, and really does show up
 * in the admin Orders table and on the dashboard tiles.
 * Returns the new order, or null if the cart was empty.
 */
export function placeOrder(customer) {
  if (!cart.length) return null;
  const first = cart[0];
  const units = cartCount();
  const total = cartTotal();
  const order = {
    id: String(nextOrderId()),
    customer,
    product: first.id,
    qty: units,
    total,
    status: 'new',
    date: new Date().toISOString().slice(0, 10),
    lines: cart.map(l => ({ id: l.id, name: l.name, storage: l.storage, qty: l.qty, price: l.price })),
  };
  update(d => { d.orders = [order, ...(d.orders || [])]; }, 'order');
  clearCart();
  return order;
}

/* Order numbers continue the seeded sequence rather than restarting at 1. */
function nextOrderId() {
  const highest = (state.orders || [])
    .map(o => parseInt(o.id, 10))
    .filter(Number.isFinite)
    .reduce((a, b) => Math.max(a, b), 2000);
  return highest + 1;
}

/* ------------------------------------------------------- language & theme */

function loadPrefs() {
  try { return JSON.parse(prefStore().getItem(PREF_KEY)) || {}; } catch { return {}; }
}
let prefs = loadPrefs();

export const LANGS = ['ka', 'en', 'ru'];
export const getLang = () => (LANGS.includes(prefs.lang) ? prefs.lang : 'ka');
export const getTheme = () => (prefs.theme === 'light' ? 'light' : 'dark');

export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  prefs = { ...prefs, lang };
  try { prefStore().setItem(PREF_KEY, JSON.stringify(prefs)); } catch {}
  emit('lang');
}

export function setTheme(theme) {
  prefs = { ...prefs, theme: theme === 'light' ? 'light' : 'dark' };
  try { prefStore().setItem(PREF_KEY, JSON.stringify(prefs)); } catch {}
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
