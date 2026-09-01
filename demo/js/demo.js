/* ==========================================================================
   NORVA — demo mode

   Everything that makes this build a public demo rather than the product lives
   in this one file, so it can be deleted in a single move.

   On the flag: there is no build step here — index.html loads app.js as a plain
   ES module — so nothing can substitute a NEXT_PUBLIC_* value at build time and
   an env var cannot reach the client. IS_DEMO is therefore a constant, with a
   `?demo=0` escape hatch for looking at the build without the demo furniture.
   ========================================================================== */

import { t, getLang } from './store.js';

const params = new URLSearchParams(location.search);

/** True for the public demo build. `?demo=0` turns the demo furniture off. */
export const IS_DEMO = params.get('demo') !== '0';

const DISMISS_KEY = 'nv.demo.banner.v1';

/* ------------------------------------------------------------------ strings */

const D = {
  bannerText: {
    ka: 'ეს დემოა. კომპანია, ფასები, მარაგი და შეკვეთები მოგონილია — არაფერი აქ არსებობს სინამდვილეში.',
    en: 'This is a demo. The company, the prices, the stock and the orders are invented — none of it is real.',
    ru: 'Это демо. Компания, цены, наличие и заказы вымышлены — ничего из этого не существует.',
  },
  bannerHint: {
    ka: 'ცვლილებები ინახება მხოლოდ ამ ჩანართში.',
    en: 'Your changes live in this tab only.',
    ru: 'Изменения хранятся только в этой вкладке.',
  },
  reset: { ka: 'დემოს განულება', en: 'Reset demo data', ru: 'Сбросить данные демо' },
  resetDone: { ka: 'დემო განულდა', en: 'Demo data reset', ru: 'Данные демо сброшены' },
  dismiss: { ka: 'შეტყობინების დახურვა', en: 'Dismiss this notice', ru: 'Закрыть уведомление' },
  cms: { ka: 'CMS', en: 'CMS', ru: 'CMS' },
  shop: { ka: 'მაღაზია', en: 'Storefront', ru: 'Магазин' },

  title: { ka: 'დემოში გამორთულია', en: 'Switched off in the demo', ru: 'Отключено в демо' },
  close: { ka: 'დახურვა', en: 'Close', ru: 'Закрыть' },
  real: {
    ka: 'რას აკეთებს ეს რეალურ პროდუქტში:',
    en: 'What this does in the real product:',
    ru: 'Что это делает в реальном продукте:',
  },
};

/* Only what genuinely cannot be faked in a browser. Ordinary CRUD is never
   blocked — creating, editing, deleting and reordering all really work. */
const FEATURES = {
  booking: {
    what: { ka: 'სახელოსნოში ჩაწერა', en: 'Booking a workshop slot', ru: 'Запись в мастерскую' },
    why: {
      ka: 'დადასტურება დაჯავშნიდა რეალურ დროს და გააგზავნიდა SMS-ს თქვენს ნომერზე.',
      en: 'Confirming would hold a real slot and text a real phone number.',
      ru: 'Подтверждение заняло бы реальный слот и отправило бы SMS на реальный номер.',
    },
  },
  contact: {
    what: { ka: 'დარეკვა და მეილი', en: 'Calling and emailing', ru: 'Звонок и почта' },
    why: {
      ka: 'ნომრები და მისამართი მოგონილია — არსად არ დარეკავს.',
      en: 'The numbers and the address are invented, so there is nothing to dial.',
      ru: 'Номера и адрес вымышлены — звонить некуда.',
    },
  },
  social: {
    what: { ka: 'სოციალური ქსელები', en: 'Social profiles', ru: 'Соцсети' },
    why: {
      ka: 'დემო ბრენდს პროფილები არ აქვს.',
      en: 'The demo brand has no profiles to link to.',
      ru: 'У демо-бренда нет профилей.',
    },
  },
  upload: {
    what: { ka: 'ფოტოს ატვირთვა', en: 'Uploading a photo', ru: 'Загрузка фото' },
    why: {
      ka: 'ატვირთვას სჭირდება ფაილსაცავი. არჩეული ფოტო ქვემოთ ჩანს, მაგრამ არსად იგზავნება.',
      en: 'A real upload needs object storage. The picture you chose is previewed below, but it goes nowhere.',
      ru: 'Настоящая загрузка требует хранилища. Выбранное фото показано ниже, но никуда не отправляется.',
    },
  },
  importJSON: {
    what: { ka: 'კატალოგის იმპორტი', en: 'Importing a catalogue', ru: 'Импорт каталога' },
    why: {
      ka: 'იმპორტი კითხულობს ნებისმიერ ატვირთულ ფაილს და მთლიანად ცვლის კატალოგს. საჯარო დემოში გამორთულია.',
      en: 'Import reads an arbitrary uploaded file and replaces the whole catalogue. That stays off on a public demo.',
      ru: 'Импорт читает произвольный файл и заменяет весь каталог. На публичном демо это отключено.',
    },
  },
};

/* ------------------------------------------------------------ block notice */

let sheet = null;

function ensureSheet() {
  if (sheet) return sheet;
  sheet = document.createElement('dialog');
  sheet.className = 'demo-block';
  sheet.innerHTML = `
    <div class="demo-block__inner">
      <p class="demo-block__eyebrow" data-x="title"></p>
      <h2 class="demo-block__title" data-x="what"></h2>
      <p class="demo-block__why" data-x="why"></p>
      <button class="btn btn--primary demo-block__ok" data-x="close"></button>
    </div>`;
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
  sheet.querySelector('.demo-block__ok').addEventListener('click', () => sheet.close());
  document.body.append(sheet);
  return sheet;
}

/**
 * Tell the visitor why one specific thing is switched off, without hiding or
 * disabling the control — the button still looks and behaves like a button.
 * @param {keyof FEATURES} feature
 */
export function demoBlocked(feature) {
  const f = FEATURES[feature];
  if (!f) return;
  const el = ensureSheet();
  el.querySelector('[data-x="title"]').textContent = t(D.title);
  el.querySelector('[data-x="what"]').textContent = t(f.what);
  el.querySelector('[data-x="why"]').textContent = t(f.why);
  el.querySelector('[data-x="close"]').textContent = t(D.close);
  el.setAttribute('lang', getLang());
  if (!el.open) el.showModal();
}

/** Wire a click handler that blocks instead of acting. Returns the handler. */
export function blockOn(feature) {
  return e => { e.preventDefault(); e.stopPropagation(); demoBlocked(feature); };
}

/* ------------------------------------------------------------------ banner */

/**
 * Mount the demo banner. Slim, dismissible for the session, and carrying the
 * one control a visitor needs when they have edited the catalogue into a
 * corner: put it back.
 *
 * There is no role switcher because the product has no roles — the CMS has no
 * login, no session and no permission check anywhere. Inventing roles here
 * would be inventing a feature, so the banner links to the CMS instead.
 *
 * @param {object} opts
 * @param {'shop'|'cms'} opts.here   which surface is mounting it
 * @param {() => void}   opts.onReset
 */
export function mountBanner({ here, onReset }) {
  if (!IS_DEMO) return;
  try { if (sessionStorage.getItem(DISMISS_KEY) === '1') return; } catch {}

  const bar = document.createElement('div');
  bar.className = 'demo-bar';
  bar.setAttribute('role', 'note');
  bar.innerHTML = `
    <div class="demo-bar__inner">
      <span class="demo-bar__dot" aria-hidden="true"></span>
      <p class="demo-bar__text">
        <b data-x="text"></b>
        <span class="demo-bar__hint" data-x="hint"></span>
      </p>
      <div class="demo-bar__acts">
        <a class="demo-bar__link" data-x="cross"></a>
        <button class="demo-bar__btn" data-x="reset"></button>
        <button class="demo-bar__x" data-x="dismiss" aria-label="">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </div>
    </div>`;

  const cross = bar.querySelector('[data-x="cross"]');
  cross.href = here === 'cms' ? './index.html' : './admin.html';

  const paint = () => {
    bar.querySelector('[data-x="text"]').textContent = t(D.bannerText);
    bar.querySelector('[data-x="hint"]').textContent = t(D.bannerHint);
    bar.querySelector('[data-x="reset"]').textContent = t(D.reset);
    cross.textContent = here === 'cms' ? t(D.shop) : t(D.cms);
    bar.querySelector('[data-x="dismiss"]').setAttribute('aria-label', t(D.dismiss));
  };
  paint();

  bar.querySelector('[data-x="reset"]').addEventListener('click', () => onReset?.());
  bar.querySelector('[data-x="dismiss"]').addEventListener('click', () => {
    bar.remove();
    document.documentElement.classList.remove('has-demo-bar');
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch {}
  });

  document.body.prepend(bar);
  document.documentElement.classList.add('has-demo-bar');
  return { repaint: paint, resetLabel: () => t(D.resetDone) };
}

export const RESET_DONE = D.resetDone;
export const RESET_LABEL = D.reset;
