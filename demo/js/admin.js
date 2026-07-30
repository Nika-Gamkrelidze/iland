/* ==========================================================================
   iLand — admin CMS
   Writes to store.js, which is the same object the storefront reads. Every
   save goes through S.update(), so index.html repaints itself — including in
   another tab, because store.js re-loads on the `storage` event.

   Nothing here is decorative: the panel exists to make the brand's promise
   ("one island, published numbers") operable — prices, instalment figures,
   repair costs, turnaround and stock are all edited in one place and shown
   exactly as the shopper will see them.
   ========================================================================== */

import * as S from './store.js';
import { deviceSVG, DEVICE_KEYS } from './devices.js';

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Same day-stamp store.js uses for promo windows, so a campaign that reads
   "live" here is exactly the one the storefront is applying. */
const today = () => new Date().toISOString().slice(0, 10);

/** Date maths in UTC — a local-midnight Date would slide a day in GE (+04). */
function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const numOr = (v, fallback = 0) => {
  const n = Number(String(v ?? '').trim().replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
};

const slug = s => String(s || '')
  .toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'item';

/* ==========================================================================
   Admin UI strings — Georgian first, all three languages, no exceptions.
   Mkhedruli is unicameral, so every label is authored in sentence case and
   the CSS only uppercases :lang(en) / :lang(ru).
   ========================================================================== */

const A = {
  panel:        { ka: 'მართვის პანელი',        en: 'Admin panel',        ru: 'Панель управления' },
  storefront:   { ka: 'მაღაზია',               en: 'Storefront',         ru: 'Магазин' },

  navDashboard: { ka: 'მიმოხილვა',             en: 'Dashboard',          ru: 'Обзор' },
  navProducts:  { ka: 'პროდუქტები',            en: 'Products',           ru: 'Товары' },
  navBanners:   { ka: 'ბანერები',              en: 'Banners',            ru: 'Баннеры' },
  navSales:     { ka: 'ფასდაკლებები',          en: 'Sales',              ru: 'Скидки' },
  navService:   { ka: 'სერვისი',               en: 'Service',            ru: 'Сервис' },
  navOrders:    { ka: 'შეკვეთები',             en: 'Orders',             ru: 'Заказы' },
  navSettings:  { ka: 'პარამეტრები',           en: 'Settings',           ru: 'Настройки' },

  eyeDashboard: { ka: 'გამოქვეყნებული ციფრები', en: 'Published numbers',  ru: 'Открытые цифры' },
  eyeProducts:  { ka: 'კატალოგი',              en: 'Catalogue',          ru: 'Каталог' },
  eyeBanners:   { ka: 'მთავარი გვერდი',        en: 'Home page',          ru: 'Главная страница' },
  eyeSales:     { ka: 'კამპანიები',            en: 'Campaigns',          ru: 'Кампании' },
  eyeService:   { ka: 'შეკეთების ფასები',      en: 'Repair prices',      ru: 'Цены на ремонт' },
  eyeOrders:    { ka: 'გაყიდვები',             en: 'Sales floor',        ru: 'Продажи' },
  eyeSettings:  { ka: 'მაღაზიის მონაცემები',   en: 'Shop data',          ru: 'Данные магазина' },

  /* generic */
  save:         { ka: 'შენახვა',               en: 'Save',               ru: 'Сохранить' },
  saved:        { ka: 'შენახულია',             en: 'Saved',              ru: 'Сохранено' },
  cancel:       { ka: 'გაუქმება',              en: 'Cancel',             ru: 'Отмена' },
  close:        { ka: 'დახურვა',               en: 'Close',              ru: 'Закрыть' },
  del:          { ka: 'წაშლა',                 en: 'Delete',             ru: 'Удалить' },
  deleted:      { ka: 'წაიშალა',               en: 'Deleted',            ru: 'Удалено' },
  duplicate:    { ka: 'დუბლირება',             en: 'Duplicate',          ru: 'Дублировать' },
  duplicated:   { ka: 'დუბლირებულია',          en: 'Duplicated',         ru: 'Дублировано' },
  add:          { ka: 'დამატება',              en: 'Add',                ru: 'Добавить' },
  edit:         { ka: 'რედაქტირება',           en: 'Edit',               ru: 'Редактировать' },
  active:       { ka: 'აქტიური',               en: 'Active',             ru: 'Активно' },
  unsaved:      { ka: 'შეუნახავი ცვლილება',    en: 'Unsaved changes',    ru: 'Есть изменения' },
  preview:      { ka: 'გადახედვა',             en: 'Live preview',       ru: 'Предпросмотр' },
  none:         { ka: 'არცერთი',               en: 'None',               ru: 'Нет' },
  all:          { ka: 'ყველა',                 en: 'All',                ru: 'Все' },
  search:       { ka: 'ძებნა',                 en: 'Search',             ru: 'Поиск' },
  searchPh:     { ka: 'დასახელება ან SKU…',    en: 'Name or SKU…',       ru: 'Название или SKU…' },
  moveUp:       { ka: 'ზემოთ',                 en: 'Move up',            ru: 'Выше' },
  moveDown:     { ka: 'ქვემოთ',                en: 'Move down',          ru: 'Ниже' },
  nothing:      { ka: 'ჯერ არაფერია',          en: 'Nothing here yet',   ru: 'Пока пусто' },
  required:     { ka: 'ველი სავალდებულოა',     en: 'This field is required', ru: 'Обязательное поле' },
  langKa:       { ka: 'ქართული',               en: 'Georgian',           ru: 'Грузинский' },
  langEn:       { ka: 'ინგლისური',             en: 'English',            ru: 'Английский' },
  langRu:       { ka: 'რუსული',                en: 'Russian',            ru: 'Русский' },

  /* dashboard */
  statProducts: { ka: 'პროდუქტი კატალოგში',    en: 'products in catalogue', ru: 'товаров в каталоге' },
  statPromos:   { ka: 'აქტიური კამპანია',      en: 'live campaigns',     ru: 'активных кампаний' },
  statToday:    { ka: 'დღევანდელი შეკვეთა',    en: 'orders today',       ru: 'заказов сегодня' },
  statRevenue:  { ka: 'შემოსავალი, 7 დღე',     en: 'revenue, 7 days',    ru: 'выручка, 7 дней' },
  statLow:      { ka: 'მცირე მარაგი (≤5)',     en: 'low stock (≤5)',     ru: 'мало на складе (≤5)' },
  outOfStock:   { ka: 'მარაგში აღარ არის',     en: 'out of stock',       ru: 'нет в наличии' },
  ofThem:       { ka: 'აქედან',                en: 'of them',            ru: 'из них' },
  spark:        { ka: 'შემოსავალი დღეების მიხედვით', en: 'Revenue by day', ru: 'Выручка по дням' },
  peak:         { ka: 'პიკი',                  en: 'peak',               ru: 'пик' },
  recentOrders: { ka: 'ბოლო შეკვეთები',        en: 'Recent orders',      ru: 'Последние заказы' },
  cancelledNote:{ ka: 'გაუქმებული შეკვეთები არ ითვლება', en: 'Cancelled orders are excluded', ru: 'Отменённые заказы не учитываются' },

  /* products */
  newProduct:   { ka: 'ახალი პროდუქტი',        en: 'New product',        ru: 'Новый товар' },
  colProduct:   { ka: 'პროდუქტი',              en: 'Product',            ru: 'Товар' },
  colCategory:  { ka: 'კატეგორია',             en: 'Category',           ru: 'Категория' },
  colPrice:     { ka: 'ფასი',                  en: 'Price',              ru: 'Цена' },
  colFinal:     { ka: 'საბოლოო ფასი',          en: 'Effective',          ru: 'Итоговая' },
  colStock:     { ka: 'მარაგი',                en: 'Stock',              ru: 'Склад' },
  colBadge:     { ka: 'ნიშანი',                en: 'Badge',              ru: 'Метка' },
  colFeatured:  { ka: 'რჩეული',                en: 'Featured',           ru: 'Избранное' },
  found:        { ka: 'ნაპოვნია',              en: 'found',              ru: 'найдено' },

  fName:        { ka: 'დასახელება',            en: 'Name',               ru: 'Название' },
  fSku:         { ka: 'SKU კოდი',              en: 'SKU',                ru: 'Артикул' },
  fDevice:      { ka: 'ილუსტრაციის ტიპი',      en: 'Illustration',       ru: 'Иллюстрация' },
  fGroup:       { ka: 'აქსესუარის ჯგუფი',      en: 'Accessory group',    ru: 'Группа аксессуаров' },
  fCondition:   { ka: 'მდგომარეობა',           en: 'Condition',          ru: 'Состояние' },
  condNew:      { ka: 'ახალი',                 en: 'New',                ru: 'Новый' },
  condDemo:     { ka: 'დემო',                  en: 'Demo',               ru: 'Демо' },
  fBadge:       { ka: 'ნიშანი ბარათზე',        en: 'Card badge',         ru: 'Метка на карточке' },
  fStock:       { ka: 'მარაგი (ცალი)',         en: 'Stock (units)',      ru: 'Остаток (шт.)' },
  fRating:      { ka: 'რეიტინგი',              en: 'Rating',             ru: 'Рейтинг' },
  fReviews:     { ka: 'შეფასებები',            en: 'Reviews',            ru: 'Отзывы' },
  fPrice:       { ka: 'ფასი, ₾',               en: 'Price, ₾',           ru: 'Цена, ₾' },
  fOldPrice:    { ka: 'ძველი ფასი, ₾',         en: 'Old price, ₾',       ru: 'Старая цена, ₾' },
  fTagline:     { ka: 'მოკლე აღწერა',          en: 'Tagline',            ru: 'Короткое описание' },
  fFeatured:    { ka: 'მთავარ გვერდზე',        en: 'Show as featured',   ru: 'В избранном' },
  grpBasics:    { ka: 'ძირითადი',              en: 'Basics',             ru: 'Основное' },
  grpPrice:     { ka: 'ფასი და მარაგი',        en: 'Price and stock',    ru: 'Цена и остаток' },
  grpCopy:      { ka: 'ტექსტი',                en: 'Copy',               ru: 'Тексты' },
  grpStorage:   { ka: 'მეხსიერების საფეხურები', en: 'Storage tiers',     ru: 'Варианты памяти' },
  grpColors:    { ka: 'ფერები',                en: 'Finishes',           ru: 'Цвета' },
  grpSpecs:     { ka: 'მახასიათებლები',        en: 'Specifications',     ru: 'Характеристики' },
  fSize:        { ka: 'ზომა',                  en: 'Size',               ru: 'Размер' },
  fDelta:       { ka: 'დანამატი, ₾',           en: 'Delta, ₾',           ru: 'Доплата, ₾' },
  fFinish:      { ka: 'ფერი',                  en: 'Finish',             ru: 'Цвет' },
  fHex:         { ka: 'ფერის კოდი',            en: 'Hex',                ru: 'Hex' },
  fColorName:   { ka: 'ფერის სახელი',          en: 'Finish name',        ru: 'Название цвета' },
  customHex:    { ka: 'საკუთარი ფერი',         en: 'Custom hex',         ru: 'Свой цвет' },
  fSpecKa:      { ka: 'დასახელება (ქარ)',      en: 'Label (ka)',         ru: 'Название (груз.)' },
  fSpecEn:      { ka: 'დასახელება (ინგ)',      en: 'Label (en)',         ru: 'Название (англ.)' },
  fSpecV:       { ka: 'მნიშვნელობა',           en: 'Value',              ru: 'Значение' },
  effective:    { ka: 'საბოლოო ფასი',          en: 'Effective price',    ru: 'Итоговая цена' },
  perMonth:     { ka: 'თვეში, 12 თვე',         en: 'per month, 12 mo',   ru: 'в месяц, 12 мес' },
  errPrice:     { ka: 'ფასი უნდა იყოს ნულზე მეტი რიცხვი', en: 'Price must be a positive number', ru: 'Цена должна быть положительным числом' },
  errSku:       { ka: 'ასეთი SKU უკვე არსებობს', en: 'This SKU is already used', ru: 'Такой артикул уже есть' },
  errStock:     { ka: 'მარაგი არ შეიძლება იყოს უარყოფითი', en: 'Stock cannot be negative', ru: 'Остаток не может быть отрицательным' },
  warnOld:      { ka: 'ძველი ფასი ახალზე ნაკლებია — გადახაზული ფასი არ გამოჩნდება', en: 'Old price is below the price — no strike-through will be shown', ru: 'Старая цена ниже текущей — зачёркивание не появится' },
  confirmDelP:  { ka: 'წავშალოთ ეს პროდუქტი? მოქმედება შეუქცევადია.', en: 'Delete this product? This cannot be undone.', ru: 'Удалить товар? Действие необратимо.' },
  refs:         { ka: 'დაკავშირებული ჩანაწერი', en: 'linked records',    ru: 'связанных записей' },
  copySuffix:   { ka: '(ასლი)',                en: '(copy)',             ru: '(копия)' },

  /* banners */
  newBanner:    { ka: 'ახალი ბანერი',          en: 'New banner',         ru: 'Новый баннер' },
  fEyebrow:     { ka: 'ზედა წარწერა',          en: 'Eyebrow',            ru: 'Надзаголовок' },
  fTitle:       { ka: 'სათაური',               en: 'Title',              ru: 'Заголовок' },
  fSub:         { ka: 'აღწერა',                en: 'Sub-heading',        ru: 'Подзаголовок' },
  fCta:         { ka: 'ღილაკის ტექსტი',        en: 'Button label',       ru: 'Текст кнопки' },
  fLinked:      { ka: 'დაკავშირებული პროდუქტი', en: 'Linked product',    ru: 'Связанный товар' },
  fHref:        { ka: 'ბმული',                 en: 'Link',               ru: 'Ссылка' },
  fTone:        { ka: 'ტონი',                  en: 'Tone',               ru: 'Тон' },
  slidePos:     { ka: 'პოზიცია',               en: 'Position',           ru: 'Позиция' },

  /* sales */
  newPromo:     { ka: 'ახალი კამპანია',        en: 'New campaign',       ru: 'Новая кампания' },
  fLabel:       { ka: 'კამპანიის სახელი',      en: 'Campaign label',     ru: 'Название кампании' },
  fBadgeText:   { ka: 'ნიშნის ტექსტი',         en: 'Badge text',         ru: 'Текст метки' },
  fType:        { ka: 'ფასდაკლების ტიპი',      en: 'Discount type',      ru: 'Тип скидки' },
  typePercent:  { ka: 'პროცენტი',              en: 'Percent',            ru: 'Процент' },
  typeFixed:    { ka: 'ფიქსირებული თანხა',     en: 'Fixed amount',       ru: 'Фиксированная сумма' },
  fValue:       { ka: 'მნიშვნელობა',           en: 'Value',              ru: 'Значение' },
  fScope:       { ka: 'მოქმედების არე',        en: 'Scope',              ru: 'Область' },
  scopeAll:     { ka: 'ყველა პროდუქტი',        en: 'All products',       ru: 'Все товары' },
  scopeCat:     { ka: 'კატეგორია',             en: 'Category',           ru: 'Категория' },
  scopeProd:    { ka: 'ერთი პროდუქტი',         en: 'Single product',     ru: 'Один товар' },
  fTarget:      { ka: 'სამიზნე',               en: 'Target',             ru: 'Цель' },
  fStarts:      { ka: 'დაწყება',               en: 'Starts',             ru: 'Начало' },
  fEnds:        { ka: 'დასრულება',             en: 'Ends',               ru: 'Конец' },
  stLive:       { ka: 'მიმდინარე',             en: 'Live',               ru: 'Идёт' },
  stScheduled:  { ka: 'დაგეგმილი',             en: 'Scheduled',          ru: 'Запланировано' },
  stExpired:    { ka: 'ვადაგასული',            en: 'Expired',            ru: 'Истекло' },
  stPaused:     { ka: 'გამორთული',             en: 'Paused',             ru: 'Выключено' },
  hits:         { ka: 'მოქმედებს პროდუქტზე',   en: 'products affected',  ru: 'товаров затронуто' },
  example:      { ka: 'მაგალითი',              en: 'Example',            ru: 'Пример' },
  errDates:     { ka: 'დასრულების თარიღი დაწყებაზე გვიან უნდა იყოს', en: 'End date must be after the start date', ru: 'Дата окончания должна быть позже начала' },
  errValue:     { ka: 'მნიშვნელობა ნულზე მეტი უნდა იყოს', en: 'Value must be greater than zero', ru: 'Значение должно быть больше нуля' },
  errPercent:   { ka: 'პროცენტი 100-ს ვერ გადააჭარბებს', en: 'Percent cannot exceed 100', ru: 'Процент не может превышать 100' },
  errTarget:    { ka: 'აირჩიე სამიზნე',        en: 'Pick a target',      ru: 'Выберите цель' },

  /* service */
  newService:   { ka: 'ახალი სერვისი',         en: 'New service',        ru: 'Новая услуга' },
  fSvcName:     { ka: 'სერვისის დასახელება',   en: 'Service name',       ru: 'Название услуги' },
  fSvcDesc:     { ka: 'აღწერა',                en: 'Description',        ru: 'Описание' },
  fFrom:        { ka: 'ფასი -დან, ₾',          en: 'From price, ₾',      ru: 'Цена от, ₾' },
  fEta:         { ka: 'ვადა',                  en: 'Turnaround',         ru: 'Срок' },
  fWarrantyM:   { ka: 'გარანტია, თვე',         en: 'Warranty, months',   ru: 'Гарантия, мес.' },
  fIcon:        { ka: 'იკონა',                 en: 'Icon',               ru: 'Иконка' },
  free:         { ka: 'უფასო',                 en: 'Free',               ru: 'Бесплатно' },
  monthsShort:  { ka: 'თვე',                   en: 'mo',                 ru: 'мес' },

  /* orders */
  colOrder:     { ka: 'შეკვეთა',               en: 'Order',              ru: 'Заказ' },
  colDate:      { ka: 'თარიღი',                en: 'Date',               ru: 'Дата' },
  colCustomer:  { ka: 'მყიდველი',              en: 'Customer',           ru: 'Покупатель' },
  colQty:       { ka: 'რაოდ.',                 en: 'Qty',                ru: 'Кол-во' },
  colTotal:     { ka: 'ჯამი',                  en: 'Total',              ru: 'Сумма' },
  colStatus:    { ka: 'სტატუსი',               en: 'Status',             ru: 'Статус' },
  osNew:        { ka: 'ახალი',                 en: 'New',                ru: 'Новый' },
  osPacking:    { ka: 'იკვრება',               en: 'Packing',            ru: 'Собирается' },
  osShipped:    { ka: 'გზაშია',                en: 'Shipped',            ru: 'Отправлен' },
  osDone:       { ka: 'დასრულებული',           en: 'Done',               ru: 'Выполнен' },
  osCancelled:  { ka: 'გაუქმებული',            en: 'Cancelled',          ru: 'Отменён' },
  statusSaved:  { ka: 'სტატუსი შეიცვალა',      en: 'Status updated',     ru: 'Статус обновлён' },
  revenueAll:   { ka: 'ჯამური შემოსავალი',     en: 'Total revenue',      ru: 'Общая выручка' },

  /* settings */
  grpSite:      { ka: 'მაღაზია',               en: 'Shop',               ru: 'Магазин' },
  grpCommerce:  { ka: 'პირობები',              en: 'Commerce',           ru: 'Условия' },
  grpPartners:  { ka: 'განვადების პარტნიორები', en: 'Instalment partners', ru: 'Партнёры рассрочки' },
  grpData:      { ka: 'მონაცემები',            en: 'Data',               ru: 'Данные' },
  fSiteName:    { ka: 'სახელი',                en: 'Name',               ru: 'Название' },
  fSiteNameKa:  { ka: 'სახელი ქართულად',       en: 'Name in Georgian',   ru: 'Название по-грузински' },
  fLegal:       { ka: 'იურიდიული პირი',        en: 'Legal entity',       ru: 'Юрлицо' },
  fTaxId:       { ka: 'საიდენტიფიკაციო კოდი',  en: 'Tax ID',             ru: 'Налоговый код' },
  fEmail:       { ka: 'ელფოსტა',               en: 'Email',              ru: 'Эл. почта' },
  fPhones:      { ka: 'ტელეფონები',            en: 'Phones',             ru: 'Телефоны' },
  fPhone:       { ka: 'ტელეფონი',              en: 'Phone',              ru: 'Телефон' },
  fAddress:     { ka: 'მისამართი',             en: 'Address',            ru: 'Адрес' },
  fHours:       { ka: 'სამუშაო საათები',       en: 'Opening hours',      ru: 'Часы работы' },
  fCurrency:    { ka: 'ვალუტის ნიშანი',        en: 'Currency symbol',    ru: 'Символ валюты' },
  fFreeShip:    { ka: 'უფასო მიტანა თანხიდან, ₾', en: 'Free shipping over, ₾', ru: 'Бесплатная доставка от, ₾' },
  fDelivHours:  { ka: 'მიტანა თბილისში, საათი', en: 'Tbilisi delivery, hours', ru: 'Доставка по Тбилиси, ч' },
  fRegionDays:  { ka: 'მიტანა რეგიონებში, დღე', en: 'Regions delivery, days', ru: 'Доставка в регионы, дн.' },
  fWarrantyMo:  { ka: 'გარანტია, თვე',         en: 'Warranty, months',   ru: 'Гарантия, мес.' },
  fReturnDays:  { ka: 'დაბრუნება, დღე',        en: 'Returns, days',      ru: 'Возврат, дней' },
  fTestBanner:  { ka: 'სატესტო რეჟიმის ბანერი', en: 'Test-mode banner',  ru: 'Баннер тестового режима' },
  testHint:     { ka: 'ძველ საიტს ეს ჩართული დარჩა და ცოცხლად ეწერა „ტესტ რეჟიმში“. თუ არ გჭირდება — გამორთე.', en: 'The old site shipped this switched on and told every shopper it was in test mode. Leave it off.', ru: 'На старом сайте это осталось включённым и сообщало покупателям о тестовом режиме. Держите выключенным.' },
  fPartner:     { ka: 'პარტნიორი',             en: 'Partner',            ru: 'Партнёр' },
  fRate:        { ka: 'განაკვეთი, %',          en: 'Rate, %',            ru: 'Ставка, %' },
  fMonths:      { ka: 'თვეები (მძიმით)',       en: 'Months (comma list)', ru: 'Месяцы (через запятую)' },
  fPartnerLbl:  { ka: 'ნიშნული',               en: 'Label',              ru: 'Метка' },
  exportJson:   { ka: 'JSON-ის ჩამოტვირთვა',   en: 'Export JSON',        ru: 'Экспорт JSON' },
  importJson:   { ka: 'JSON-ის ატვირთვა',      en: 'Import JSON',        ru: 'Импорт JSON' },
  resetFactory: { ka: 'ქარხნულ მდგომარეობაზე დაბრუნება', en: 'Reset to factory', ru: 'Сброс к заводским' },
  confirmReset: { ka: 'ყველა ცვლილება წაიშლება და კატალოგი ქარხნულ მდგომარეობას დაუბრუნდება. გავაგრძელოთ?', en: 'Every local edit is discarded and the catalogue returns to the shipped one. Continue?', ru: 'Все изменения будут удалены, каталог вернётся к заводскому. Продолжить?' },
  exported:     { ka: 'ფაილი ჩამოიტვირთა',     en: 'File downloaded',    ru: 'Файл загружен' },
  imported:     { ka: 'იმპორტი დასრულდა',      en: 'Import complete',    ru: 'Импорт завершён' },
  importFail:   { ka: 'იმპორტი ვერ მოხერხდა',  en: 'Import failed',      ru: 'Импорт не удался' },
  resetDone:    { ka: 'ქარხნული მდგომარეობა აღდგა', en: 'Factory catalogue restored', ru: 'Заводской каталог восстановлен' },
  dataNote:     { ka: 'ექსპორტი მთელ CMS-ს ერთ ფაილში ინახავს — ეს არის „გამოქვეყნების“ არტეფაქტი.', en: 'Export writes the whole CMS to one file — that file is the publish artefact.', ru: 'Экспорт сохраняет весь CMS в один файл — это артефакт публикации.' },
};

const u = key => S.t(A[key]);
const tt = bag => S.t(bag);

/* ------------------------------------------------------------------ icons */

const ICON = {
  grid:    '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
  box:     '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
  image:   '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17.5 5-4 4 3 3-2 4 3"/>',
  tag:     '<path d="M3.5 11.5v-8h8l9 9-8 8z"/><circle cx="7.6" cy="7.6" r="1.4"/>',
  wrench:  '<path d="M20 6.4a5 5 0 0 1-6.6 6.6L6 20.4 3.6 18l7.4-7.4A5 5 0 0 1 17.6 4l-3 3 2.4 2.4 3-3z"/>',
  receipt: '<path d="M5.5 3.5h13v17l-2.2-1.4-2.1 1.4-2.2-1.4-2.2 1.4-2.1-1.4-2.2 1.4z"/><path d="M9 8.5h6M9 12.5h6"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  x:       '<path d="m6 6 12 12M18 6 6 18"/>',
  check:   '<path d="m4 12.5 5 5L20 6.5"/>',
  up:      '<path d="M12 19.5V5M6 11l6-6 6 6"/>',
  down:    '<path d="M12 4.5V19M18 13l-6 6-6-6"/>',
  copy:    '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 5.5h-9a2 2 0 0 0-2 2v9"/>',
  trash:   '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  external:'<path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  download:'<path d="M12 4v11M7 11l5 5 5-5M4.5 20h15"/>',
  upload:  '<path d="M12 20V9M7 13l5-5 5 5M4.5 4h15"/>',
  reset:   '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  searchI: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  screen:  '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10 5.5h4"/>',
  battery: '<rect x="2.5" y="8" width="16" height="8" rx="2"/><path d="M21 11v2"/><path d="M6 11v2"/>',
  water:   '<path d="M12 3s6 6.6 6 10.4A6 6 0 0 1 6 13.4C6 9.6 12 3 12 3Z"/>',
  data:    '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/>',
  diag:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/><path d="M8 11h6M11 8v6"/>',
  tradein: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  shield:  '<path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  truck:   '<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
  clock:   '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
};

const icon = (name, size = 18) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}"
        aria-hidden="true">${ICON[name] || ''}</svg>`;

/* Icon keys the storefront's service cards can actually draw. */
const SERVICE_ICONS = ['screen', 'battery', 'water', 'data', 'diag', 'tradein', 'shield', 'truck', 'clock'];

/* ----------------------------------------------------------------- toasts */

function toast(msg, kind = 'ok') {
  const zone = $('#toastZone');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(kind === 'ok' ? 'check' : 'x', 17)}<span>${esc(msg)}</span>`;
  if (kind !== 'ok') el.style.borderColor = 'var(--danger)';
  zone.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2600);
}

/* ==========================================================================
   Form primitives
   Every control gets a real <label for>, and every validated control gets an
   error paragraph wired through aria-describedby.
   ========================================================================== */

const inp = ({ id, name, value = '', type = 'text', attrs = '', describe = true }) =>
  `<input class="a-in" type="${type}" id="${esc(id)}" name="${esc(name)}"
          value="${esc(value)}"${describe ? ` aria-describedby="e-${esc(name)}"` : ''} ${attrs}>`;

const sel = ({ id, name, value, options, attrs = '', describe = true }) =>
  `<select class="a-in" id="${esc(id)}" name="${esc(name)}"${describe ? ` aria-describedby="e-${esc(name)}"` : ''} ${attrs}>
     ${options.map(o => `<option value="${esc(o.v)}"${String(o.v) === String(value ?? '') ? ' selected' : ''}>${esc(o.t)}</option>`).join('')}
   </select>`;

const ta = ({ id, name, value = '', rows = 2 }) =>
  `<textarea class="a-in" id="${esc(id)}" name="${esc(name)}" rows="${rows}"
             aria-describedby="e-${esc(name)}">${esc(value)}</textarea>`;

/* `err: false` for controls inside repeaters — their `name` repeats per row,
   and an error box per row would mint duplicate element ids. */
function field({ id, name, label, control, hint, err = true }) {
  return `
  <div class="a-field">
    <label for="${esc(id)}">${esc(label)}</label>
    ${control}
    ${hint ? `<p class="a-hint">${esc(hint)}</p>` : ''}
    ${err ? `<p class="a-err" id="e-${esc(name)}" data-err="${esc(name)}"></p>` : ''}
  </div>`;
}

/** Text field, id derived from name. */
const tf = (name, label, value, opts = {}) => field({
  id: `f-${name}`, name, label, hint: opts.hint,
  control: inp({ id: `f-${name}`, name, value, type: opts.type || 'text', attrs: opts.attrs || '' }),
});

/** Select field, id derived from name. */
const sf = (name, label, value, options, opts = {}) => field({
  id: `f-${name}`, name, label, hint: opts.hint,
  control: sel({ id: `f-${name}`, name, value, options, attrs: opts.attrs || '' }),
});

/** Textarea field, id derived from name. */
const tas = (name, label, value, opts = {}) => field({
  id: `f-${name}`, name, label, hint: opts.hint,
  control: ta({ id: `f-${name}`, name, value, rows: opts.rows || 2 }),
});

/** Switch — a real checkbox with a wrapping label, so it is announced and
    toggled like one; the track is drawn by the sibling span. */
const toggle = (name, label, checked) => `
  <label class="a-sw">
    <input type="checkbox" class="sr" id="f-${esc(name)}" name="${esc(name)}"${checked ? ' checked' : ''}>
    <span class="a-sw__track" aria-hidden="true"></span>
    <span class="a-sw__label">${esc(label)}</span>
  </label>`;

/** One field in all three languages. Georgian sits first, always. */
function triField(prefix, legend, bag = {}, opts = {}) {
  const rows = opts.rows || 2;
  const one = (l, labelKey) => field({
    id: `f-${prefix}-${l}`, name: `${prefix}-${l}`, label: u(labelKey),
    control: opts.multiline
      ? ta({ id: `f-${prefix}-${l}`, name: `${prefix}-${l}`, value: bag?.[l] || '', rows })
      : inp({ id: `f-${prefix}-${l}`, name: `${prefix}-${l}`, value: bag?.[l] || '' }),
  });
  return `
  <fieldset class="a-fs">
    <legend class="a-legend">${esc(legend)}</legend>
    <div class="a-tri">
      ${one('ka', 'langKa')}${one('en', 'langEn')}${one('ru', 'langRu')}
    </div>
  </fieldset>`;
}

const val = (root, name) => root.querySelector(`[name="${CSS.escape(name)}"]`)?.value ?? '';
const checked = (root, name) => !!root.querySelector(`[name="${CSS.escape(name)}"]`)?.checked;
const readTri = (root, prefix) => ({
  ka: val(root, `${prefix}-ka`).trim(),
  en: val(root, `${prefix}-en`).trim(),
  ru: val(root, `${prefix}-ru`).trim(),
});

function clearErrors(root) {
  $$('.a-err', root).forEach(e => { e.textContent = ''; });
  $$('[aria-invalid="true"]', root).forEach(e => e.setAttribute('aria-invalid', 'false'));
}

/** Paint one inline error. Returns false so callers can `ok = setErr(...) && ok`. */
function setErr(root, name, msg) {
  const box = root.querySelector(`[data-err="${CSS.escape(name)}"]`);
  if (box) box.textContent = msg;
  const ctl = root.querySelector(`[name="${CSS.escape(name)}"]`);
  if (ctl) ctl.setAttribute('aria-invalid', 'true');
  return false;
}

function focusFirstError(root) {
  const first = $('[aria-invalid="true"]', root);
  if (first) { first.focus(); first.scrollIntoView({ block: 'center' }); }
}

/* ==========================================================================
   Slide-over
   A native <dialog>: Esc closes it, focus is trapped, the page behind is
   inert — none of which is worth re-implementing by hand.
   ========================================================================== */

const sheet = $('#sheet');
let sheetCfg = null;
let sheetDirty = false;
let lastFocus = null;

function openSheet(cfg) {
  sheetCfg = cfg;
  sheetDirty = false;
  lastFocus = document.activeElement;

  sheet.innerHTML = `
  <form class="sheet__form" id="sheetForm" novalidate>
    <header class="sheet__head">
      <div>
        <p class="a-eyebrow">${esc(cfg.eyebrow || '')}</p>
        <h2 class="sheet__title" id="sheetTitle">${esc(cfg.title)}</h2>
      </div>
      <div class="flex gap-3 items-center">
        <span class="a-dirty" id="sheetDirty" hidden>${esc(u('unsaved'))}</span>
        <button type="button" class="icon-btn" id="sheetClose" aria-label="${esc(u('close'))}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </div>
    </header>

    <div class="sheet__body${cfg.preview ? ' sheet__body--split' : ''}">
      <div class="sheet__fields" id="sheetFields">${cfg.body}</div>
      ${cfg.preview ? '<aside class="sheet__preview" id="sheetPreview"></aside>' : ''}
    </div>

    <footer class="sheet__foot">
      <div class="flex gap-2 wrap-flex">
        ${cfg.onDuplicate ? `<button type="button" class="btn btn--ghost btn--sm" id="sheetDup">${icon('copy', 15)} ${esc(u('duplicate'))}</button>` : ''}
        ${cfg.onDelete ? `<button type="button" class="btn btn--ghost btn--sm" id="sheetDel">${icon('trash', 15)} ${esc(u('del'))}</button>` : ''}
      </div>
      <div class="flex gap-2 wrap-flex">
        <button type="button" class="btn btn--ghost btn--sm" id="sheetCancel">${esc(u('cancel'))}</button>
        <button type="submit" class="btn btn--primary btn--sm">${icon('check', 15)} ${esc(u('save'))}</button>
      </div>
    </footer>
  </form>`;

  const form = $('#sheetForm');
  refreshPreview();

  const touched = () => {
    sheetDirty = true;
    $('#sheetDirty').hidden = false;
    refreshPreview();
  };
  form.addEventListener('input', touched);
  form.addEventListener('change', e => {
    touched();
    cfg.onChange?.(form, e);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors(form);
    if (cfg.onSave(form) === false) { focusFirstError(form); return; }
    sheetDirty = false;
    sheet.close();
  });

  $('#sheetClose').addEventListener('click', () => sheet.close());
  $('#sheetCancel').addEventListener('click', () => sheet.close());
  $('#sheetDup')?.addEventListener('click', () => cfg.onDuplicate(form));
  $('#sheetDel')?.addEventListener('click', () => cfg.onDelete(form));

  sheet.showModal();
  cfg.onMount?.(form);
  $('.sheet__fields .a-in', sheet)?.focus();
}

function refreshPreview() {
  if (!sheetCfg?.preview) return;
  const box = $('#sheetPreview');
  const form = $('#sheetForm');
  if (box && form) box.innerHTML = sheetCfg.preview(form);
}

sheet.addEventListener('close', () => {
  sheetCfg = null;
  sheetDirty = false;
  lastFocus?.focus?.();
});

/* ==========================================================================
   Shared render pieces
   ========================================================================== */

/** The storefront's own product card, rebuilt from an uncommitted draft so
    the editor shows exactly what the shopper will get. */
function previewCard(p) {
  const color = p.colors?.[0]?.hex || '#C2BCB2';
  const pr = S.priceOf(p);
  const st = S.stockState(p);
  const per = S.monthly(pr.final, 12);
  const badges = {
    new:        `<span class="badge badge--new">${esc(u('condNew'))}</span>`,
    sale:       '',
    demo:       '<span class="badge badge--demo">DEMO</span>',
    bestseller: '<span class="badge badge--best">★</span>',
  };
  return `
  <article class="card">
    <div class="card__badges">${badges[p.badge] || ''}</div>
    <div class="card__media">${deviceSVG(p.device, color)}</div>
    <h3 class="card__name">${esc(p.name || '—')}</h3>
    <p class="card__tag">${esc(tt(p.tagline) || ' ')}</p>
    <div class="card__foot">
      <div class="price-row">
        <span class="price num">${esc(S.gel(pr.final))}</span>
        ${pr.was ? `<span class="price-was num">${esc(S.gel(pr.was))}</span>
                    <span class="price-off">−${pr.off}%</span>` : ''}
      </div>
      ${pr.final >= 100 ? `<div class="price-monthly"><b class="num">${esc(S.gel(per))}</b> ${esc(u('perMonth'))}</div>` : ''}
      <div class="flex between items-center mt-3">
        <span class="stock stock--${esc(st.key)}">${esc(S.t(st))}</span>
        <div class="card__swatches">
          ${(p.colors || []).slice(0, 4).map(c =>
            `<span class="swatch a-swatch" style="background:${esc(c.hex)}" title="${esc(S.t(c))}"></span>`).join('')}
        </div>
      </div>
    </div>
  </article>`;
}

const readout = rows => `
  <div class="a-readout">
    ${rows.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
  </div>`;

const catOptions = (withAll = false) => {
  const cats = S.getState().categories.map(c => ({ v: c.id, t: S.t(c) }));
  return withAll ? [{ v: 'all', t: u('all') }, ...cats] : cats;
};

const productOptions = (withNone = false) => {
  const list = S.getState().products.map(p => ({ v: p.id, t: `${p.name} · ${p.sku}` }));
  return withNone ? [{ v: '', t: u('none') }, ...list] : list;
};

const stockDot = p => {
  const st = S.stockState(p);
  return `<span class="a-dot a-dot--${st.key}"></span>`;
};

/* ==========================================================================
   1 — Dashboard
   ========================================================================== */

/** Seven day buckets of non-cancelled order value. */
function revenueSeries(orders, days = 7) {
  const paid = (orders || []).filter(o => o.status !== 'cancelled');
  const dayEnd = today();
  const windowStart = addDays(dayEnd, -(days - 1));
  const newest = paid.map(o => o.date).filter(Boolean).sort().at(-1);
  /* If every order predates the window the chart would be seven flat zeroes,
     which tells nobody anything — anchor on the newest order instead. */
  const anchor = newest && newest < windowStart ? newest : dayEnd;

  const keys = Array.from({ length: days }, (_, i) => addDays(anchor, i - days + 1));
  const bucket = new Map(keys.map(k => [k, 0]));
  paid.forEach(o => {
    if (bucket.has(o.date)) bucket.set(o.date, bucket.get(o.date) + (Number(o.total) || 0));
  });
  return keys.map(k => ({ date: k, value: bucket.get(k) }));
}

function sparkline(series) {
  const W = 720, H = 190, top = 16, bot = 22;
  const max = Math.max(1, ...series.map(s => s.value));
  const col = W / series.length;
  const pts = series.map((s, i) => [col * (i + 0.5), top + (1 - s.value / max) * (H - top - bot)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts.at(-1)[0].toFixed(1)} ${H - bot} L${pts[0][0].toFixed(1)} ${H - bot} Z`;

  return `
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(u('spark'))}" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" class="spark-a0"/><stop offset="1" class="spark-a1"/>
      </linearGradient>
    </defs>
    <line class="spark-grid" x1="0" y1="${top}" x2="${W}" y2="${top}" stroke-dasharray="3 7"/>
    <path d="${area}" fill="url(#sparkFill)"/>
    <path class="spark-line" d="${line}" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <line class="spark-base" x1="0" y1="${H - bot}" x2="${W}" y2="${H - bot}" stroke-width="1"/>
    ${pts.map(([x, y], i) => `<circle class="spark-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"
        r="${i === pts.length - 1 ? 5.5 : 3.5}" opacity="${i === pts.length - 1 ? 1 : 0.55}"/>`).join('')}
  </svg>`;
}

function dayLabels(series) {
  const lang = S.getLang();
  const locale = lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-GB';
  return `
  <div class="a-spark__labels">
    ${series.map(s => {
      const d = new Date(`${s.date}T00:00:00Z`);
      const wd = d.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' });
      return `<span><b>${esc(S.gel(s.value, { symbol: false }))}</b>${esc(wd)} ${d.getUTCDate()}</span>`;
    }).join('')}
  </div>`;
}

function orderStatePill(status) {
  const label = { new: 'osNew', packing: 'osPacking', shipped: 'osShipped', done: 'osDone', cancelled: 'osCancelled' }[status] || 'osNew';
  return `<span class="a-state a-state--${esc(status)}">${esc(u(label))}</span>`;
}

function viewDashboard() {
  const st = S.getState();
  const series = revenueSeries(st.orders);
  const weekTotal = series.reduce((n, s) => n + s.value, 0);
  const peak = Math.max(...series.map(s => s.value));
  const todayIso = today();
  const ordersToday = (st.orders || []).filter(o => o.date === todayIso).length;
  const low = st.products.filter(p => Number(p.stock) <= 5);
  const out = low.filter(p => Number(p.stock) <= 0);
  const recent = [...(st.orders || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);

  return `
  <section class="a-stats">
    <div class="a-stat">
      <b class="num">${st.products.length}</b>
      <span>${esc(u('statProducts'))}</span>
      <small>${st.products.filter(p => p.featured).length} · ${esc(u('fFeatured'))}</small>
    </div>
    <div class="a-stat a-stat--accent">
      <b class="num">${S.livePromos(st).length}</b>
      <span>${esc(u('statPromos'))}</span>
      <small>${(st.promos || []).length} · ${esc(u('all'))}</small>
    </div>
    <div class="a-stat">
      <b class="num">${ordersToday}</b>
      <span>${esc(u('statToday'))}</span>
      <small>${esc(todayIso)}</small>
    </div>
    <div class="a-stat a-stat--accent">
      <b class="num">${esc(S.gel(weekTotal))}</b>
      <span>${esc(u('statRevenue'))}</span>
      <small>${esc(u('cancelledNote'))}</small>
    </div>
    <div class="a-stat${low.length ? ' a-stat--warn' : ''}">
      <b class="num">${low.length}</b>
      <span>${esc(u('statLow'))}</span>
      <small>${out.length} ${esc(u('ofThem'))} ${esc(u('outOfStock'))}</small>
    </div>
  </section>

  <section class="a-card">
    <div class="a-card__head">
      <h2 class="a-card__title">${esc(u('spark'))}</h2>
      <span class="a-pill">${esc(u('peak'))} ${esc(S.gel(peak))}</span>
    </div>
    <div class="a-spark">
      ${sparkline(series)}
      ${dayLabels(series)}
    </div>
  </section>

  <section class="a-card">
    <div class="a-card__head">
      <h2 class="a-card__title">${esc(u('recentOrders'))}</h2>
      <a class="btn btn--ghost btn--sm" href="#/orders">${esc(u('navOrders'))} →</a>
    </div>
    ${recent.length ? `
    <div class="a-tablewrap">
      <table class="a-table">
        <thead><tr>
          <th>${esc(u('colOrder'))}</th><th>${esc(u('colDate'))}</th>
          <th>${esc(u('colCustomer'))}</th><th>${esc(u('colProduct'))}</th>
          <th>${esc(u('colTotal'))}</th><th>${esc(u('colStatus'))}</th>
        </tr></thead>
        <tbody>
          ${recent.map(o => {
            const p = st.products.find(x => x.id === o.product);
            return `<tr>
              <td class="mono">#${esc(o.id)}</td>
              <td class="num">${esc(o.date)}</td>
              <td>${esc(o.customer)}</td>
              <td>${esc(p?.name || o.product)}${o.qty > 1 ? ` <span class="a-sub">× ${o.qty}</span>` : ''}</td>
              <td class="num">${esc(S.gel(o.total))}</td>
              <td>${orderStatePill(o.status)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : `<p class="a-empty">${esc(u('nothing'))}</p>`}
  </section>`;
}

/* ==========================================================================
   2 — Products
   ========================================================================== */

const productFilter = { q: '', cat: 'all' };

function filteredProducts() {
  const st = S.getState();
  const q = productFilter.q.trim().toLowerCase();
  return st.products.filter(p => {
    if (productFilter.cat !== 'all' && p.category !== productFilter.cat) return false;
    if (!q) return true;
    return [p.name, p.sku, p.id, p.group, p.tagline?.ka, p.tagline?.en, p.tagline?.ru]
      .filter(Boolean).join(' ').toLowerCase().includes(q);
  });
}

function productRows() {
  const st = S.getState();
  const rows = filteredProducts();
  if (!rows.length) return `<tr><td colspan="8"><p class="a-empty">${esc(u('nothing'))}</p></td></tr>`;

  return rows.map(p => {
    const pr = S.priceOf(p, st);
    const cat = st.categories.find(c => c.id === p.category);
    const hex = p.colors?.[0]?.hex || '#7D7E80';
    return `
    <tr data-open="${esc(p.id)}">
      <td><div class="a-thumb">${deviceSVG(p.device, hex)}</div></td>
      <td>
        <button type="button" class="a-rowbtn" data-open-btn="${esc(p.id)}">${esc(p.name)}</button>
        <span class="a-sub mono">${esc(p.sku)}</span>
      </td>
      <td>${esc(S.t(cat) || p.category)}</td>
      <td class="num">${esc(S.gel(p.price))}</td>
      <td class="num">${pr.final < pr.base
        ? `<b style="color:var(--accent)">${esc(S.gel(pr.final))}</b> <span class="a-sub">−${pr.off}%</span>`
        : `<span class="dim">${esc(S.gel(pr.final))}</span>`}</td>
      <td><span class="flex gap-2 items-center">${stockDot(p)}<span class="num">${Number(p.stock) || 0}</span></span></td>
      <td>${p.badge ? `<span class="badge badge--${esc(p.badge === 'bestseller' ? 'best' : p.badge)}">${esc(p.badge)}</span>` : '<span class="dim">—</span>'}</td>
      <td>
        <button type="button" class="a-switch" data-featured="${esc(p.id)}"
                aria-pressed="${p.featured ? 'true' : 'false'}"
                aria-label="${esc(u('fFeatured'))} — ${esc(p.name)}"></button>
      </td>
    </tr>`;
  }).join('');
}

function viewProducts() {
  return `
  <section class="a-card">
    <div class="a-toolbar">
      <div class="a-field a-toolbar__grow">
        <label for="prodSearch">${esc(u('search'))}</label>
        <input class="a-in" type="search" id="prodSearch" name="prodSearch"
               value="${esc(productFilter.q)}" placeholder="${esc(u('searchPh'))}" autocomplete="off">
      </div>
      <div class="a-field">
        <label for="prodCat">${esc(u('colCategory'))}</label>
        ${sel({ id: 'prodCat', name: 'prodCat', value: productFilter.cat, options: catOptions(true), describe: false })}
      </div>
      <button class="btn btn--primary btn--sm" id="newProduct">${icon('plus', 15)} ${esc(u('newProduct'))}</button>
    </div>

    <div class="a-tablewrap">
      <table class="a-table">
        <thead><tr>
          <th><span class="sr">${esc(u('preview'))}</span></th>
          <th>${esc(u('colProduct'))}</th>
          <th>${esc(u('colCategory'))}</th>
          <th>${esc(u('colPrice'))}</th>
          <th>${esc(u('colFinal'))}</th>
          <th>${esc(u('colStock'))}</th>
          <th>${esc(u('colBadge'))}</th>
          <th>${esc(u('colFeatured'))}</th>
        </tr></thead>
        <tbody id="prodRows">${productRows()}</tbody>
      </table>
    </div>
    <p class="a-hint mt-3" id="prodCount">${filteredProducts().length} ${esc(u('found'))}</p>
  </section>`;
}

function wireProducts() {
  const rows = $('#prodRows');

  const repaint = () => {
    rows.innerHTML = productRows();
    $('#prodCount').textContent = `${filteredProducts().length} ${u('found')}`;
    wireRows();
  };

  function wireRows() {
    $$('[data-featured]', rows).forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.featured;
      S.update(d => {
        const p = d.products.find(x => x.id === id);
        if (p) p.featured = !p.featured;
      }, 'update');
      toast(u('saved'));
    }));
  }

  rows.addEventListener('click', e => {
    if (e.target.closest('.a-switch')) return;
    const tr = e.target.closest('tr[data-open]');
    if (tr) openProductSheet(tr.dataset.open);
  });

  $('#prodSearch').addEventListener('input', e => { productFilter.q = e.target.value; repaint(); });
  $('#prodCat').addEventListener('change', e => { productFilter.cat = e.target.value; repaint(); });
  $('#newProduct').addEventListener('click', () => openProductSheet(null));

  wireRows();
}

/* --------------------------------------------------------- product editor */

function blankProduct() {
  const cat = S.getState().categories[0]?.id || 'iphone';
  return {
    id: '', sku: '', category: cat, device: 'iphone', name: '',
    tagline: { ka: '', en: '', ru: '' },
    price: 0, oldPrice: null, condition: 'new', badge: null, featured: false,
    rating: 5, reviews: 0,
    storage: [{ size: '—', delta: 0 }],
    colors: [S.FINISHES.silver],
    stock: 0, specs: [],
  };
}

const finishOptions = () => [
  ...Object.entries(S.FINISHES).map(([k, f]) => ({ v: k, t: `${f.en} · ${S.t(f)}` })),
  { v: 'custom', t: u('customHex') },
];

const finishKeyOf = colour =>
  Object.entries(S.FINISHES).find(([, f]) => f.id === colour?.id)?.[0] || 'custom';

function storageRows(list) {
  if (!list.length) return `<p class="a-empty">${esc(u('nothing'))}</p>`;
  return list.map((s, i) => `
    <div class="a-rep__row" data-row="${i}">
      ${field({ err: false, id: `f-st-size-${i}`, name: 'st-size', label: u('fSize'),
                control: inp({ id: `f-st-size-${i}`, name: 'st-size', value: s.size, describe: false }) })}
      ${field({ err: false, id: `f-st-delta-${i}`, name: 'st-delta', label: u('fDelta'),
                control: inp({ id: `f-st-delta-${i}`, name: 'st-delta', value: s.delta ?? 0, type: 'number', attrs: 'step="1"', describe: false }) })}
      <button type="button" class="a-x" data-del-row="storage" data-i="${i}"
              aria-label="${esc(u('del'))}">${icon('x', 14)}</button>
    </div>`).join('');
}

function colorRows(list) {
  if (!list.length) return `<p class="a-empty">${esc(u('nothing'))}</p>`;
  return list.map((c, i) => `
    <div class="a-rep__row" data-row="${i}">
      ${field({ err: false, id: `f-c-finish-${i}`, name: 'c-finish', label: u('fFinish'),
                control: sel({ id: `f-c-finish-${i}`, name: 'c-finish', value: finishKeyOf(c), options: finishOptions(), describe: false }) })}
      ${field({ err: false, id: `f-c-hex-${i}`, name: 'c-hex', label: u('fHex'),
                control: inp({ id: `f-c-hex-${i}`, name: 'c-hex', value: c.hex || '#CCCCCC', type: 'color', describe: false }) })}
      ${field({ err: false, id: `f-c-name-${i}`, name: 'c-name', label: u('fColorName'),
                control: inp({ id: `f-c-name-${i}`, name: 'c-name', value: c.en || '', describe: false }) })}
      <button type="button" class="a-x" data-del-row="colors" data-i="${i}"
              aria-label="${esc(u('del'))}">${icon('x', 14)}</button>
    </div>`).join('');
}

function specRows(list) {
  if (!list.length) return `<p class="a-empty">${esc(u('nothing'))}</p>`;
  return list.map((s, i) => `
    <div class="a-rep__row" data-row="${i}">
      ${field({ err: false, id: `f-sp-ka-${i}`, name: 'sp-ka', label: u('fSpecKa'),
                control: inp({ id: `f-sp-ka-${i}`, name: 'sp-ka', value: s.ka || '', describe: false }) })}
      ${field({ err: false, id: `f-sp-en-${i}`, name: 'sp-en', label: u('fSpecEn'),
                control: inp({ id: `f-sp-en-${i}`, name: 'sp-en', value: s.en || '', describe: false }) })}
      ${field({ err: false, id: `f-sp-v-${i}`, name: 'sp-v', label: u('fSpecV'),
                control: inp({ id: `f-sp-v-${i}`, name: 'sp-v', value: s.v || '', describe: false }) })}
      <button type="button" class="a-x" data-del-row="specs" data-i="${i}"
              aria-label="${esc(u('del'))}">${icon('x', 14)}</button>
    </div>`).join('');
}

/** Read the whole form back into a product-shaped object. */
function readProduct(form, base) {
  const d = structuredClone(base);
  d.name = val(form, 'name').trim();
  d.sku = val(form, 'sku').trim();
  d.category = val(form, 'category');
  d.device = val(form, 'device');
  d.group = val(form, 'group') || undefined;
  d.condition = val(form, 'condition');
  d.badge = val(form, 'badge') || null;
  d.featured = checked(form, 'featured');
  d.stock = Math.round(numOr(val(form, 'stock'), 0));
  d.rating = numOr(val(form, 'rating'), 5);
  d.reviews = Math.round(numOr(val(form, 'reviews'), 0));
  d.price = numOr(val(form, 'price'), 0);
  const old = val(form, 'oldPrice').trim();
  d.oldPrice = old === '' ? null : numOr(old, 0);
  d.tagline = readTri(form, 'tagline');

  d.storage = $$('[data-rep="storage"] [data-row]', form).map(row => ({
    size: row.querySelector('[name="st-size"]').value.trim() || '—',
    delta: Math.round(numOr(row.querySelector('[name="st-delta"]').value, 0)),
  }));

  d.colors = $$('[data-rep="colors"] [data-row]', form).map(row => {
    const key = row.querySelector('[name="c-finish"]').value;
    const hex = row.querySelector('[name="c-hex"]').value;
    const label = row.querySelector('[name="c-name"]').value.trim();
    const known = S.FINISHES[key];
    /* A known finish keeps its Georgian name; a custom one reuses the typed
       label for all three languages rather than inventing a translation. */
    if (known && known.hex.toLowerCase() === hex.toLowerCase() && (!label || label === known.en)) {
      return { ...known };
    }
    return { id: slug(label || hex), en: label || hex, ka: known && label === known.en ? known.ka : (label || hex), hex };
  });

  d.specs = $$('[data-rep="specs"] [data-row]', form).map(row => ({
    ka: row.querySelector('[name="sp-ka"]').value.trim(),
    en: row.querySelector('[name="sp-en"]').value.trim(),
    v: row.querySelector('[name="sp-v"]').value.trim(),
  })).filter(s => s.ka || s.en || s.v);

  return d;
}

function openProductSheet(id) {
  const isNew = !id;
  const existing = id ? S.getState().products.find(p => p.id === id) : null;
  let draft = existing ? structuredClone(existing) : blankProduct();

  const body = `
  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpBasics'))}</h3>
    <div class="a-row a-row--2">
      ${tf('name', u('fName'), draft.name, { attrs: 'required' })}
      ${tf('sku', u('fSku'), draft.sku, { attrs: 'autocapitalize="characters"' })}
    </div>
    <div class="a-row">
      ${sf('category', u('colCategory'), draft.category, catOptions())}
      ${sf('device', u('fDevice'), draft.device, DEVICE_KEYS.map(k => ({ v: k, t: k })))}
      ${sf('group', u('fGroup'), draft.group || '', [{ v: '', t: '—' }, ...S.ACCESSORY_GROUPS.map(g => ({ v: g, t: g }))])}
    </div>
    <div class="a-row">
      ${sf('condition', u('fCondition'), draft.condition, [{ v: 'new', t: u('condNew') }, { v: 'demo', t: u('condDemo') }])}
      ${sf('badge', u('fBadge'), draft.badge || '', [
        { v: '', t: u('none') }, { v: 'new', t: 'new' }, { v: 'sale', t: 'sale' },
        { v: 'demo', t: 'demo' }, { v: 'bestseller', t: 'bestseller' }])}
      ${tf('rating', u('fRating'), draft.rating ?? 5, { type: 'number', attrs: 'step="0.1" min="0" max="5"' })}
      ${tf('reviews', u('fReviews'), draft.reviews ?? 0, { type: 'number', attrs: 'step="1" min="0"' })}
    </div>
    <div class="a-check">${toggle('featured', u('fFeatured'), !!draft.featured)}</div>
  </div>

  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpPrice'))}</h3>
    <div class="a-row">
      ${tf('price', u('fPrice'), draft.price, { type: 'number', attrs: 'step="1" min="0" required' })}
      ${tf('oldPrice', u('fOldPrice'), draft.oldPrice ?? '', { type: 'number', attrs: 'step="1" min="0"' })}
      ${tf('stock', u('fStock'), draft.stock ?? 0, { type: 'number', attrs: 'step="1" min="0"' })}
    </div>
    <p class="a-warn" id="oldPriceWarn"></p>
  </div>

  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpCopy'))}</h3>
    ${triField('tagline', u('fTagline'), draft.tagline, { multiline: true, rows: 2 })}
  </div>

  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpStorage'))} <span>· ${esc(u('fDelta'))}</span></h3>
    <div class="a-rep" data-rep="storage">${storageRows(draft.storage || [])}</div>
    <button type="button" class="btn btn--ghost btn--sm" data-add-row="storage">${icon('plus', 14)} ${esc(u('add'))}</button>
  </div>

  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpColors'))}</h3>
    <div class="a-rep" data-rep="colors">${colorRows(draft.colors || [])}</div>
    <button type="button" class="btn btn--ghost btn--sm" data-add-row="colors">${icon('plus', 14)} ${esc(u('add'))}</button>
  </div>

  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpSpecs'))}</h3>
    <div class="a-rep" data-rep="specs">${specRows(draft.specs || [])}</div>
    <button type="button" class="btn btn--ghost btn--sm" data-add-row="specs">${icon('plus', 14)} ${esc(u('add'))}</button>
  </div>`;

  const preview = form => {
    const d = readProduct(form, draft);
    const pr = S.priceOf(d);
    const warn = $('#oldPriceWarn', form);
    if (warn) warn.textContent = d.oldPrice && d.oldPrice <= d.price ? u('warnOld') : '';
    return `
      <p class="a-eyebrow">${esc(u('preview'))}</p>
      ${previewCard(d)}
      ${readout([
        [u('effective'), S.gel(pr.final)],
        [u('perMonth'), S.gel(S.monthly(pr.final, 12))],
        [u('colStock'), `${d.stock}`],
        [u('fSku'), d.sku || '—'],
      ])}`;
  };

  const rerenderRep = (form, which) => {
    const d = readProduct(form, draft);
    draft = d;
    const box = $(`[data-rep="${which}"]`, form);
    box.innerHTML = which === 'storage' ? storageRows(d.storage)
                  : which === 'colors' ? colorRows(d.colors)
                  : specRows(d.specs);
    refreshPreview();
  };

  openSheet({
    eyebrow: isNew ? u('newProduct') : u('navProducts'),
    title: isNew ? u('newProduct') : draft.name,
    body,
    preview,

    onMount(form) {
      form.addEventListener('click', e => {
        const add = e.target.closest('[data-add-row]');
        if (add) {
          const which = add.dataset.addRow;
          draft = readProduct(form, draft);
          if (which === 'storage') draft.storage.push({ size: '', delta: 0 });
          if (which === 'colors') draft.colors.push({ ...S.FINISHES.silver });
          if (which === 'specs') draft.specs.push({ ka: '', en: '', v: '' });
          rerenderRep(form, which);
          return;
        }
        const del = e.target.closest('[data-del-row]');
        if (del) {
          const which = del.dataset.delRow;
          draft = readProduct(form, draft);
          draft[which].splice(Number(del.dataset.i), 1);
          rerenderRep(form, which);
        }
      });
    },

    /* Picking a named finish fills in its hex and label — the custom hex
       field stays free for anything Apple has not shipped yet. */
    onChange(form, e) {
      if (!e.target.matches('[name="c-finish"]')) return;
      const row = e.target.closest('[data-row]');
      const f = S.FINISHES[e.target.value];
      if (!f) return;
      row.querySelector('[name="c-hex"]').value = f.hex;
      row.querySelector('[name="c-name"]').value = f.en;
      refreshPreview();
    },

    onSave(form) {
      const d = readProduct(form, draft);
      const state = S.getState();
      let ok = true;

      if (!d.name) ok = setErr(form, 'name', u('required'));
      if (!(d.price > 0)) ok = setErr(form, 'price', u('errPrice'));
      if (d.stock < 0) ok = setErr(form, 'stock', u('errStock'));
      if (!d.sku) ok = setErr(form, 'sku', u('required'));
      else if (state.products.some(p => p.sku.toLowerCase() === d.sku.toLowerCase() && p.id !== id)) {
        ok = setErr(form, 'sku', u('errSku'));
      }
      if (!ok) return false;

      if (isNew) {
        d.id = uniqueId(slug(d.name), state.products.map(p => p.id));
        S.update(s => { s.products.push(d); }, 'update');
      } else {
        S.update(s => {
          const i = s.products.findIndex(p => p.id === id);
          if (i > -1) s.products[i] = d;
        }, 'update');
      }
      toast(`${u('saved')} — ${d.name}`);
      return true;
    },

    /* Duplicate and delete only make sense once the record exists. */
    onDuplicate: isNew ? null : function (form) {
      const d = readProduct(form, draft);
      const state = S.getState();
      d.id = uniqueId(`${slug(d.name)}-copy`, state.products.map(p => p.id));
      d.sku = uniqueSku(`${d.sku}-2`, state.products.map(p => p.sku));
      d.name = `${d.name} ${u('copySuffix')}`;
      d.featured = false;
      S.update(s => { s.products.push(d); }, 'update');
      sheet.close();
      toast(`${u('duplicated')} — ${d.name}`);
    },

    onDelete: isNew ? null : function () {
      const state = S.getState();
      const links = (state.banners || []).filter(b => b.product === id).length
                  + (state.orders || []).filter(o => o.product === id).length;
      const msg = links ? `${u('confirmDelP')}\n${links} ${u('refs')}.` : u('confirmDelP');
      if (!confirm(msg)) return;
      S.update(s => { s.products = s.products.filter(p => p.id !== id); }, 'update');
      sheet.close();
      toast(`${u('deleted')} — ${draft.name}`);
    },
  });
}

const uniqueId = (base, taken) => {
  let id = base, n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
};
const uniqueSku = (base, taken) => {
  const up = (base || 'SKU').toUpperCase();
  let sku = up, n = 2;
  while (taken.some(s => String(s).toUpperCase() === sku)) sku = `${up}${n++}`;
  return sku;
};

/* ==========================================================================
   3 — Banners
   ========================================================================== */

const TONES = [
  { v: 'orange', t: 'orange', hex: 'var(--sun)' },
  { v: 'sky',    t: 'sky',    hex: '#7FB6E8' },
  { v: 'deep',   t: 'deep',   hex: 'var(--lume)' },
  { v: 'sand',   t: 'sand',   hex: 'var(--sand-300)' },
];
const toneHex = v => TONES.find(t => t.v === v)?.hex || 'var(--accent)';

const sortedBanners = () => [...(S.getState().banners || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

function viewBanners() {
  const list = sortedBanners();
  return `
  <section class="a-card">
    <div class="a-card__head">
      <h2 class="a-card__title">${esc(u('navBanners'))}</h2>
      <button class="btn btn--primary btn--sm" id="newBanner">${icon('plus', 15)} ${esc(u('newBanner'))}</button>
    </div>

    ${list.length ? `<div class="a-list">
      ${list.map((b, i) => `
      <article class="a-item">
        <div>
          <p class="a-eyebrow">${esc(tt(b.eyebrow))}</p>
          <p class="a-item__name">${esc(tt(b.title))}</p>
          <p class="a-item__meta">${esc(tt(b.sub)).slice(0, 96)}</p>
          <p class="a-item__meta">${esc(u('slidePos'))} ${i + 1} · ${esc(u('fTone'))}: ${esc(b.tone || '—')} · ${esc(b.href || '')}</p>
        </div>
        <div class="a-item__acts">
          <button type="button" class="a-x" data-move="up" data-id="${esc(b.id)}"
                  aria-label="${esc(u('moveUp'))}"${i === 0 ? ' disabled' : ''}>${icon('up', 14)}</button>
          <button type="button" class="a-x" data-move="down" data-id="${esc(b.id)}"
                  aria-label="${esc(u('moveDown'))}"${i === list.length - 1 ? ' disabled' : ''}>${icon('down', 14)}</button>
          <button type="button" class="a-switch" data-banner-active="${esc(b.id)}"
                  aria-pressed="${b.active ? 'true' : 'false'}"
                  aria-label="${esc(u('active'))} — ${esc(tt(b.title))}"></button>
          <button type="button" class="btn btn--ghost btn--sm" data-edit="${esc(b.id)}">${esc(u('edit'))}</button>
        </div>
      </article>`).join('')}
    </div>` : `<p class="a-empty">${esc(u('nothing'))}</p>`}
  </section>`;
}

function wireBanners() {
  $('#newBanner').addEventListener('click', () => openBannerSheet(null));

  $$('[data-edit]').forEach(b => b.addEventListener('click', () => openBannerSheet(b.dataset.edit)));

  $$('[data-banner-active]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.bannerActive;
    S.update(s => {
      const x = s.banners.find(v => v.id === id);
      if (x) x.active = !x.active;
    }, 'update');
    toast(u('saved'));
  }));

  $$('[data-move]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.id;
    const dir = b.dataset.move === 'up' ? -1 : 1;
    S.update(s => {
      const list = [...s.banners].sort((x, y) => (x.order || 0) - (y.order || 0));
      const i = list.findIndex(x => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      list.forEach((x, n) => { x.order = n + 1; });   /* renumber, no gaps */
      s.banners = list;
    }, 'update');
    toast(u('saved'));
  }));
}

function readBanner(form, base) {
  const b = structuredClone(base);
  b.eyebrow = readTri(form, 'eyebrow');
  b.title = readTri(form, 'title');
  b.sub = readTri(form, 'sub');
  b.cta = readTri(form, 'cta');
  b.product = val(form, 'product') || null;
  b.href = val(form, 'href').trim();
  b.tone = val(form, 'tone');
  b.active = checked(form, 'active');
  return b;
}

function openBannerSheet(id) {
  const isNew = !id;
  const existing = id ? S.getState().banners.find(b => b.id === id) : null;
  const draft = existing ? structuredClone(existing) : {
    id: '', active: true, order: (S.getState().banners || []).length + 1,
    eyebrow: { ka: '', en: '', ru: '' }, title: { ka: '', en: '', ru: '' },
    sub: { ka: '', en: '', ru: '' }, cta: { ka: '', en: '', ru: '' },
    href: '#/', product: null, tone: 'deep',
  };

  const body = `
  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpCopy'))}</h3>
    ${triField('eyebrow', u('fEyebrow'), draft.eyebrow)}
    ${triField('title', u('fTitle'), draft.title)}
    ${triField('sub', u('fSub'), draft.sub, { multiline: true, rows: 3 })}
    ${triField('cta', u('fCta'), draft.cta)}
  </div>
  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpBasics'))}</h3>
    <div class="a-row a-row--2">
      ${sf('product', u('fLinked'), draft.product || '', productOptions(true))}
      ${tf('href', u('fHref'), draft.href)}
      ${sf('tone', u('fTone'), draft.tone, TONES.map(t => ({ v: t.v, t: t.t })))}
    </div>
    <div class="a-check">${toggle('active', u('active'), !!draft.active)}</div>
  </div>`;

  openSheet({
    eyebrow: isNew ? u('newBanner') : u('navBanners'),
    title: isNew ? u('newBanner') : tt(draft.title) || u('navBanners'),
    body,

    preview(form) {
      const b = readBanner(form, draft);
      const p = b.product ? S.getState().products.find(x => x.id === b.product) : null;
      return `
        <p class="a-eyebrow">${esc(u('preview'))}</p>
        <div class="a-hero" style="--tone:${toneHex(b.tone)}">
          <p class="a-eyebrow">${esc(tt(b.eyebrow))}</p>
          <h3>${esc(tt(b.title) || '—')}</h3>
          <p>${esc(tt(b.sub))}</p>
          <div><span class="btn btn--primary btn--sm">${esc(tt(b.cta) || '—')}</span></div>
        </div>
        ${p ? readout([[u('fLinked'), p.name], [u('colPrice'), S.gel(S.priceOf(p).final)]]) : ''}`;
    },

    /* Linking a product offers its canonical storefront route, so nobody has
       to remember the hash format. */
    onChange(form, e) {
      if (!e.target.matches('[name="product"]')) return;
      const pid = e.target.value;
      const href = form.querySelector('[name="href"]');
      if (pid && (!href.value || href.value.startsWith('#/product/') || href.value === '#/')) {
        href.value = `#/product/${pid}`;
      }
    },

    onSave(form) {
      const b = readBanner(form, draft);
      if (!b.title.ka && !b.title.en && !b.title.ru) return setErr(form, 'title-ka', u('required'));
      if (isNew) {
        b.id = uniqueId(`b-${slug(b.title.en || b.title.ka)}`, S.getState().banners.map(x => x.id));
        S.update(s => {
          s.banners.push(b);
          s.banners.sort((x, y) => (x.order || 0) - (y.order || 0)).forEach((x, n) => { x.order = n + 1; });
        }, 'update');
      } else {
        S.update(s => {
          const i = s.banners.findIndex(x => x.id === id);
          if (i > -1) s.banners[i] = b;
        }, 'update');
      }
      toast(`${u('saved')} — ${tt(b.title)}`);
      return true;
    },

    onDelete() {
      if (isNew) { sheet.close(); return; }
      if (!confirm(u('confirmDelP'))) return;
      S.update(s => {
        s.banners = s.banners.filter(b => b.id !== id);
        s.banners.forEach((b, n) => { b.order = n + 1; });
      }, 'update');
      sheet.close();
      toast(u('deleted'));
    },
  });
}

/* ==========================================================================
   4 — Sales (promo campaigns)
   ========================================================================== */

/* Same rule store.js applies internally — duplicated here (it is not
   exported) so the hit count in the panel cannot drift from the shop. */
function promoApplies(promo, product) {
  if (promo.scope === 'all') return true;
  if (promo.scope === 'category') return product.category === promo.target;
  if (promo.scope === 'product') return product.id === promo.target;
  return false;
}

function promoPrice(promo, base) {
  const v = numOr(promo.value, 0);
  const out = promo.type === 'percent' ? base * (1 - v / 100) : base - v;
  return Math.max(0, Math.round(out));
}

function promoState(p) {
  if (!p.active) return 'paused';
  const d = today();
  if (p.starts && p.starts > d) return 'scheduled';
  if (p.ends && p.ends < d) return 'expired';
  return 'live';
}

const STATE_LABEL = { live: 'stLive', scheduled: 'stScheduled', expired: 'stExpired', paused: 'stPaused' };

function promoHits(promo, products = S.getState().products) {
  return products.filter(p => promoApplies(promo, p));
}

function viewSales() {
  const st = S.getState();
  const promos = st.promos || [];
  return `
  <section class="a-card">
    <div class="a-card__head">
      <h2 class="a-card__title">${esc(u('navSales'))}</h2>
      <button class="btn btn--primary btn--sm" id="newPromo">${icon('plus', 15)} ${esc(u('newPromo'))}</button>
    </div>

    ${promos.length ? `<div class="a-promos">
      ${promos.map(p => {
        const state = promoState(p);
        const hits = promoHits(p, st.products);
        const sample = hits[0];
        const target = p.scope === 'category'
          ? S.t(st.categories.find(c => c.id === p.target)) || p.target
          : p.scope === 'product' ? (st.products.find(x => x.id === p.target)?.name || p.target)
          : u('scopeAll');
        return `
        <article class="a-card a-promo" style="background:var(--bg-raised)">
          <div class="flex between items-center gap-3 wrap-flex">
            <span class="a-state a-state--${state}">${esc(u(STATE_LABEL[state]))}</span>
            <button type="button" class="a-switch" data-promo-active="${esc(p.id)}"
                    aria-pressed="${p.active ? 'true' : 'false'}"
                    aria-label="${esc(u('active'))} — ${esc(tt(p.label))}"></button>
          </div>
          <div>
            <p class="a-item__name">${esc(tt(p.label))}</p>
            <p class="a-item__meta">${p.type === 'percent' ? `−${esc(p.value)}%` : `−${esc(S.gel(p.value))}`} · ${esc(target)}</p>
          </div>
          <dl class="a-kv">
            <dt>${esc(u('fStarts'))}</dt><dd class="num">${esc(p.starts || '—')}</dd>
            <dt>${esc(u('fEnds'))}</dt><dd class="num">${esc(p.ends || '—')}</dd>
            <dt>${esc(u('hits'))}</dt><dd class="num">${hits.length}</dd>
          </dl>
          ${sample ? `
          <div class="a-example">
            <span class="a-sub">${esc(sample.name)}</span>
            <s class="num">${esc(S.gel(sample.price))}</s>
            <span>→</span>
            <b class="num">${esc(S.gel(promoPrice(p, sample.price)))}</b>
          </div>` : `<p class="a-hint">${esc(u('nothing'))}</p>`}
          <button type="button" class="btn btn--ghost btn--sm" data-edit-promo="${esc(p.id)}">${esc(u('edit'))}</button>
        </article>`;
      }).join('')}
    </div>` : `<p class="a-empty">${esc(u('nothing'))}</p>`}
  </section>`;
}

function wireSales() {
  $('#newPromo').addEventListener('click', () => openPromoSheet(null));
  $$('[data-edit-promo]').forEach(b => b.addEventListener('click', () => openPromoSheet(b.dataset.editPromo)));
  $$('[data-promo-active]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.promoActive;
    S.update(s => {
      const p = s.promos.find(x => x.id === id);
      if (p) p.active = !p.active;
    }, 'update');
    toast(u('saved'));
  }));
}

function readPromo(form, base) {
  const p = structuredClone(base);
  p.label = readTri(form, 'label');
  p.badge = readTri(form, 'badge');
  p.type = val(form, 'type');
  p.value = numOr(val(form, 'value'), 0);
  p.scope = val(form, 'scope');
  p.target = p.scope === 'all' ? null : val(form, 'target');
  p.starts = val(form, 'starts');
  p.ends = val(form, 'ends');
  p.active = checked(form, 'active');
  return p;
}

function openPromoSheet(id) {
  const isNew = !id;
  const st = S.getState();
  const existing = id ? st.promos.find(p => p.id === id) : null;
  const draft = existing ? structuredClone(existing) : {
    id: '', active: true, label: { ka: '', en: '', ru: '' },
    type: 'percent', value: 10, scope: 'all', target: null,
    starts: today(), ends: addDays(today(), 30), badge: { ka: '', en: '', ru: '' },
  };

  const targetOptions = scope => scope === 'product' ? productOptions() : catOptions();

  const body = `
  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpCopy'))}</h3>
    ${triField('label', u('fLabel'), draft.label)}
    ${triField('badge', u('fBadgeText'), draft.badge)}
  </div>

  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpPrice'))}</h3>
    <div class="a-row">
      ${sf('type', u('fType'), draft.type, [{ v: 'percent', t: u('typePercent') }, { v: 'fixed', t: u('typeFixed') }])}
      ${tf('value', u('fValue'), draft.value, { type: 'number', attrs: 'step="1" min="0"' })}
    </div>
    <div class="a-row a-row--2">
      ${sf('scope', u('fScope'), draft.scope, [
        { v: 'all', t: u('scopeAll') }, { v: 'category', t: u('scopeCat') }, { v: 'product', t: u('scopeProd') }])}
      ${sf('target', u('fTarget'), draft.target || '', targetOptions(draft.scope),
           { attrs: draft.scope === 'all' ? 'disabled' : '' })}
    </div>
    <div class="a-row a-row--2">
      ${tf('starts', u('fStarts'), draft.starts, { type: 'date' })}
      ${tf('ends', u('fEnds'), draft.ends, { type: 'date' })}
    </div>
    <div class="a-check">${toggle('active', u('active'), !!draft.active)}</div>
  </div>`;

  openSheet({
    eyebrow: isNew ? u('newPromo') : u('navSales'),
    title: isNew ? u('newPromo') : tt(draft.label) || u('navSales'),
    body,

    preview(form) {
      const p = readPromo(form, draft);
      const state = promoState(p);
      const hits = promoHits(p);
      const sample = hits[0];
      return `
        <p class="a-eyebrow">${esc(u('preview'))}</p>
        <div><span class="a-state a-state--${state}">${esc(u(STATE_LABEL[state]))}</span></div>
        ${readout([
          [u('hits'), String(hits.length)],
          [u('fStarts'), p.starts || '—'],
          [u('fEnds'), p.ends || '—'],
        ])}
        ${sample ? `
        <p class="a-eyebrow">${esc(u('example'))}</p>
        <div class="a-example">
          <span class="a-sub">${esc(sample.name)}</span>
          <s class="num">${esc(S.gel(sample.price))}</s><span>→</span>
          <b class="num">${esc(S.gel(promoPrice(p, sample.price)))}</b>
        </div>` : `<p class="a-hint">${esc(u('nothing'))}</p>`}
        ${tt(p.badge) ? `<div><span class="badge badge--sale">${esc(tt(p.badge))}</span></div>` : ''}`;
    },

    onChange(form, e) {
      if (!e.target.matches('[name="scope"]')) return;
      const scope = e.target.value;
      const target = form.querySelector('[name="target"]');
      target.disabled = scope === 'all';
      target.innerHTML = (scope === 'product' ? productOptions() : catOptions())
        .map(o => `<option value="${esc(o.v)}">${esc(o.t)}</option>`).join('');
      refreshPreview();
    },

    onSave(form) {
      const p = readPromo(form, draft);
      let ok = true;
      if (!p.label.ka && !p.label.en && !p.label.ru) ok = setErr(form, 'label-ka', u('required'));
      if (!(p.value > 0)) ok = setErr(form, 'value', u('errValue'));
      else if (p.type === 'percent' && p.value > 100) ok = setErr(form, 'value', u('errPercent'));
      if (p.scope !== 'all' && !p.target) ok = setErr(form, 'target', u('errTarget'));
      if (p.starts && p.ends && p.ends <= p.starts) ok = setErr(form, 'ends', u('errDates'));
      if (!ok) return false;

      if (isNew) {
        p.id = uniqueId(`p-${slug(p.label.en || p.label.ka)}`, st.promos.map(x => x.id));
        S.update(s => { s.promos.push(p); }, 'update');
      } else {
        S.update(s => {
          const i = s.promos.findIndex(x => x.id === id);
          if (i > -1) s.promos[i] = p;
        }, 'update');
      }
      toast(`${u('saved')} — ${tt(p.label)}`);
      return true;
    },

    onDelete() {
      if (isNew) { sheet.close(); return; }
      if (!confirm(u('confirmDelP'))) return;
      S.update(s => { s.promos = s.promos.filter(p => p.id !== id); }, 'update');
      sheet.close();
      toast(u('deleted'));
    },
  });
}

/* ==========================================================================
   5 — Service
   ========================================================================== */

function viewService() {
  const list = S.getState().services || [];
  return `
  <section class="a-card">
    <div class="a-card__head">
      <h2 class="a-card__title">${esc(u('navService'))}</h2>
      <button class="btn btn--primary btn--sm" id="newService">${icon('plus', 15)} ${esc(u('newService'))}</button>
    </div>

    ${list.length ? `<div class="a-list">
      ${list.map(s => `
      <article class="a-item">
        <div class="flex gap-4 items-center">
          <span class="a-thumb" style="color:var(--accent)">${icon(s.icon || 'diag', 22)}</span>
          <div>
            <p class="a-item__name">${esc(tt(s.name))}</p>
            <p class="a-item__meta">${esc(tt(s.desc)).slice(0, 110)}</p>
            <p class="a-item__meta">
              ${s.from > 0 ? esc(S.gel(s.from)) : esc(u('free'))} ·
              ${esc(tt(s.eta))} ·
              ${s.warranty ? `${s.warranty} ${esc(u('monthsShort'))}` : '—'}
            </p>
          </div>
        </div>
        <div class="a-item__acts">
          <button type="button" class="btn btn--ghost btn--sm" data-edit-svc="${esc(s.id)}">${esc(u('edit'))}</button>
        </div>
      </article>`).join('')}
    </div>` : `<p class="a-empty">${esc(u('nothing'))}</p>`}
  </section>`;
}

function wireService() {
  $('#newService').addEventListener('click', () => openServiceSheet(null));
  $$('[data-edit-svc]').forEach(b => b.addEventListener('click', () => openServiceSheet(b.dataset.editSvc)));
}

function readService(form, base) {
  const s = structuredClone(base);
  s.name = readTri(form, 'name');
  s.desc = readTri(form, 'desc');
  s.eta = readTri(form, 'eta');
  s.from = Math.max(0, Math.round(numOr(val(form, 'from'), 0)));
  s.warranty = Math.max(0, Math.round(numOr(val(form, 'warranty'), 0)));
  s.icon = val(form, 'icon');
  return s;
}

function openServiceSheet(id) {
  const isNew = !id;
  const existing = id ? S.getState().services.find(s => s.id === id) : null;
  const draft = existing ? structuredClone(existing) : {
    id: '', icon: 'diag',
    name: { ka: '', en: '', ru: '' }, desc: { ka: '', en: '', ru: '' },
    from: 0, eta: { ka: '', en: '', ru: '' }, warranty: 0,
  };

  const body = `
  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpCopy'))}</h3>
    ${triField('name', u('fSvcName'), draft.name)}
    ${triField('desc', u('fSvcDesc'), draft.desc, { multiline: true, rows: 3 })}
    ${triField('eta', u('fEta'), draft.eta)}
  </div>
  <div class="a-group">
    <h3 class="a-group__title">${esc(u('grpPrice'))}</h3>
    <div class="a-row">
      ${tf('from', u('fFrom'), draft.from, { type: 'number', attrs: 'step="1" min="0"', hint: `0 = ${u('free')}` })}
      ${tf('warranty', u('fWarrantyM'), draft.warranty, { type: 'number', attrs: 'step="1" min="0"' })}
      ${sf('icon', u('fIcon'), draft.icon, SERVICE_ICONS.map(k => ({ v: k, t: k })))}
    </div>
  </div>`;

  openSheet({
    eyebrow: isNew ? u('newService') : u('navService'),
    title: isNew ? u('newService') : tt(draft.name) || u('navService'),
    body,

    preview(form) {
      const s = readService(form, draft);
      return `
        <p class="a-eyebrow">${esc(u('preview'))}</p>
        <article class="svc">
          <div class="svc__icon">${icon(s.icon || 'diag', 21)}</div>
          <h3 class="svc__name">${esc(tt(s.name) || '—')}</h3>
          <p class="svc__desc">${esc(tt(s.desc))}</p>
          <div class="svc__meta">
            <div><b class="num">${s.from > 0 ? esc(S.gel(s.from)) : esc(u('free'))}</b><span>${esc(u('colPrice'))}</span></div>
            <div><b>${esc(tt(s.eta) || '—')}</b><span>${esc(u('fEta'))}</span></div>
            ${s.warranty ? `<div><b class="num">${s.warranty} ${esc(u('monthsShort'))}</b><span>${esc(u('fWarrantyM'))}</span></div>` : ''}
          </div>
        </article>`;
    },

    onSave(form) {
      const s = readService(form, draft);
      if (!s.name.ka && !s.name.en && !s.name.ru) return setErr(form, 'name-ka', u('required'));
      if (s.from < 0) return setErr(form, 'from', u('errPrice'));
      if (isNew) {
        s.id = uniqueId(slug(s.name.en || s.name.ka), S.getState().services.map(x => x.id));
        S.update(d => { d.services.push(s); }, 'update');
      } else {
        S.update(d => {
          const i = d.services.findIndex(x => x.id === id);
          if (i > -1) d.services[i] = s;
        }, 'update');
      }
      toast(`${u('saved')} — ${tt(s.name)}`);
      return true;
    },

    onDelete() {
      if (isNew) { sheet.close(); return; }
      if (!confirm(u('confirmDelP'))) return;
      S.update(d => { d.services = d.services.filter(s => s.id !== id); }, 'update');
      sheet.close();
      toast(u('deleted'));
    },
  });
}

/* ==========================================================================
   6 — Orders
   ========================================================================== */

const ORDER_STATUSES = [
  { v: 'new', k: 'osNew' }, { v: 'packing', k: 'osPacking' }, { v: 'shipped', k: 'osShipped' },
  { v: 'done', k: 'osDone' }, { v: 'cancelled', k: 'osCancelled' },
];

const orderFilter = { status: 'all' };

function viewOrders() {
  const st = S.getState();
  const all = [...(st.orders || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const rows = orderFilter.status === 'all' ? all : all.filter(o => o.status === orderFilter.status);
  const revenue = all.filter(o => o.status !== 'cancelled').reduce((n, o) => n + (Number(o.total) || 0), 0);

  return `
  <section class="a-card">
    <div class="a-toolbar">
      <div class="a-field">
        <label for="ordStatus">${esc(u('colStatus'))}</label>
        ${sel({ id: 'ordStatus', name: 'ordStatus', value: orderFilter.status, describe: false,
                options: [{ v: 'all', t: u('all') }, ...ORDER_STATUSES.map(s => ({ v: s.v, t: u(s.k) }))] })}
      </div>
      <span class="a-pill a-pill--accent">${esc(u('revenueAll'))} ${esc(S.gel(revenue))}</span>
    </div>

    <div class="a-tablewrap">
      <table class="a-table">
        <thead><tr>
          <th>${esc(u('colOrder'))}</th><th>${esc(u('colDate'))}</th><th>${esc(u('colCustomer'))}</th>
          <th>${esc(u('colProduct'))}</th><th>${esc(u('colQty'))}</th><th>${esc(u('colTotal'))}</th>
          <th>${esc(u('colStatus'))}</th>
        </tr></thead>
        <tbody>
          ${rows.length ? rows.map(o => {
            const p = st.products.find(x => x.id === o.product);
            return `
            <tr>
              <td class="mono">#${esc(o.id)}</td>
              <td class="num">${esc(o.date)}</td>
              <td>${esc(o.customer)}</td>
              <td>${esc(p?.name || o.product)}</td>
              <td class="num">${esc(o.qty)}</td>
              <td class="num">${esc(S.gel(o.total))}</td>
              <td>
                <label class="sr" for="ord-${esc(o.id)}">${esc(u('colStatus'))} — #${esc(o.id)}</label>
                ${sel({ id: `ord-${o.id}`, name: `ord-${o.id}`, value: o.status, describe: false,
                        options: ORDER_STATUSES.map(s => ({ v: s.v, t: u(s.k) })),
                        attrs: `data-order="${esc(o.id)}"` })}
              </td>
            </tr>`;
          }).join('') : `<tr><td colspan="7"><p class="a-empty">${esc(u('nothing'))}</p></td></tr>`}
        </tbody>
      </table>
    </div>
  </section>`;
}

function wireOrders() {
  $('#ordStatus').addEventListener('change', e => {
    orderFilter.status = e.target.value;
    pendingFocus = '#ordStatus';
    render();
  });

  $$('[data-order]').forEach(sel_ => sel_.addEventListener('change', () => {
    const id = sel_.dataset.order;
    const status = sel_.value;
    pendingFocus = `#ord-${CSS.escape(id)}`;
    S.update(s => {
      const o = s.orders.find(x => x.id === id);
      if (o) o.status = status;
    }, 'update');
    toast(`${u('statusSaved')} — #${id}`);
  }));
}

/* ==========================================================================
   7 — Settings
   ========================================================================== */

function phoneRows(phones) {
  return phones.map((ph, i) => `
    <div class="a-rep__row" data-row="${i}">
      ${field({ err: false, id: `f-phone-${i}`, name: 'phone', label: `${u('fPhone')} ${i + 1}`,
                control: inp({ id: `f-phone-${i}`, name: 'phone', value: ph, describe: false }) })}
      <button type="button" class="a-x" data-del-phone="${i}" aria-label="${esc(u('del'))}">${icon('x', 14)}</button>
    </div>`).join('') || `<p class="a-empty">${esc(u('nothing'))}</p>`;
}

function partnerRows(list) {
  return list.map((p, i) => `
    <div class="a-rep__row" data-row="${i}">
      ${field({ err: false, id: `f-pn-${i}`, name: 'pn', label: u('fPartner'),
                control: inp({ id: `f-pn-${i}`, name: 'pn', value: p.name || '', describe: false }) })}
      ${field({ err: false, id: `f-pr-${i}`, name: 'pr', label: u('fRate'),
                control: inp({ id: `f-pr-${i}`, name: 'pr', value: ((Number(p.rate) || 0) * 100).toFixed(1), type: 'number', attrs: 'step="0.1" min="0"', describe: false }) })}
      ${field({ err: false, id: `f-pm-${i}`, name: 'pm', label: u('fMonths'),
                control: inp({ id: `f-pm-${i}`, name: 'pm', value: (p.months || []).join(', '), describe: false }) })}
      ${field({ err: false, id: `f-pl-${i}`, name: 'pl', label: u('fPartnerLbl'),
                control: inp({ id: `f-pl-${i}`, name: 'pl', value: p.label || '', describe: false }) })}
      <button type="button" class="a-x" data-del-partner="${i}" aria-label="${esc(u('del'))}">${icon('x', 14)}</button>
    </div>`).join('') || `<p class="a-empty">${esc(u('nothing'))}</p>`;
}

function viewSettings() {
  const st = S.getState();
  const s = st.site, cfg = st.settings || {};

  return `
  <form class="a-card" id="settingsForm" novalidate>
    <div class="a-group">
      <h3 class="a-group__title">${esc(u('grpSite'))}</h3>
      <div class="a-row a-row--2">
        ${tf('siteName', u('fSiteName'), s.name)}
        ${tf('siteNameKa', u('fSiteNameKa'), s.nameKa)}
        ${tf('email', u('fEmail'), s.email, { type: 'email' })}
      </div>
      <div class="a-row a-row--2">
        ${tf('legal', u('fLegal'), s.legal)}
        ${tf('taxId', u('fTaxId'), s.taxId)}
        ${tf('map', 'Google Maps', s.map || '')}
      </div>
      ${triField('address', u('fAddress'), s.address)}
      ${triField('hours', u('fHours'), s.hours)}

      <fieldset class="a-fs">
        <legend class="a-legend">${esc(u('fPhones'))}</legend>
        <div class="a-rep" data-rep="phones">${phoneRows(s.phones || [])}</div>
        <button type="button" class="btn btn--ghost btn--sm mt-3" id="addPhone">${icon('plus', 14)} ${esc(u('add'))}</button>
      </fieldset>
    </div>

    <div class="a-group">
      <h3 class="a-group__title">${esc(u('grpCommerce'))}</h3>
      <div class="a-row">
        ${tf('currency', u('fCurrency'), cfg.currency || '₾')}
        ${tf('freeShippingOver', u('fFreeShip'), cfg.freeShippingOver ?? 0, { type: 'number', attrs: 'step="1" min="0"' })}
        ${tf('deliveryTbilisiHours', u('fDelivHours'), cfg.deliveryTbilisiHours ?? 3, { type: 'number', attrs: 'step="1" min="0"' })}
        ${tf('deliveryRegionsDays', u('fRegionDays'), cfg.deliveryRegionsDays ?? 2, { type: 'number', attrs: 'step="1" min="0"' })}
      </div>
      <div class="a-row">
        ${tf('warrantyMonths', u('fWarrantyMo'), cfg.warrantyMonths ?? 12, { type: 'number', attrs: 'step="1" min="0"' })}
        ${tf('returnDays', u('fReturnDays'), cfg.returnDays ?? 14, { type: 'number', attrs: 'step="1" min="0"' })}
      </div>
      <div class="a-check">${toggle('testBanner', u('fTestBanner'), !!cfg.testBanner)}</div>
      <p class="a-hint">${esc(u('testHint'))}</p>
    </div>

    <div class="a-group">
      <h3 class="a-group__title">${esc(u('grpPartners'))}</h3>
      <div class="a-rep" data-rep="partners">${partnerRows(st.instalments || [])}</div>
      <button type="button" class="btn btn--ghost btn--sm" id="addPartner">${icon('plus', 14)} ${esc(u('add'))}</button>
    </div>

    <div class="a-group">
      <button type="submit" class="btn btn--primary btn--sm">${icon('check', 15)} ${esc(u('save'))}</button>
    </div>
  </form>

  <section class="a-card">
    <div class="a-card__head">
      <h2 class="a-card__title">${esc(u('grpData'))}</h2>
    </div>
    <p class="a-hint">${esc(u('dataNote'))}</p>
    <div class="flex gap-3 wrap-flex mt-4">
      <button class="btn btn--ghost btn--sm" id="exportBtn">${icon('download', 15)} ${esc(u('exportJson'))}</button>
      <button class="btn btn--ghost btn--sm" id="importBtn">${icon('upload', 15)} ${esc(u('importJson'))}</button>
      <input type="file" id="importFile" accept="application/json,.json" class="sr" aria-label="${esc(u('importJson'))}">
      <button class="btn btn--ghost btn--sm" id="resetBtn">${icon('reset', 15)} ${esc(u('resetFactory'))}</button>
    </div>
  </section>`;
}

function wireSettings() {
  const form = $('#settingsForm');

  const readPhones = () => $$('[data-rep="phones"] [data-row]', form)
    .map(r => r.querySelector('[name="phone"]').value.trim()).filter(Boolean);

  const readPartners = () => $$('[data-rep="partners"] [data-row]', form).map(r => {
    const name = r.querySelector('[name="pn"]').value.trim();
    const rate = numOr(r.querySelector('[name="pr"]').value, 0) / 100;
    const months = r.querySelector('[name="pm"]').value
      .split(',').map(x => Math.round(numOr(x, 0))).filter(n => n > 0);
    const label = r.querySelector('[name="pl"]').value.trim();
    return {
      id: slug(name),
      name,
      months: months.length ? months : [12],
      rate,
      label: label || `${Math.round(rate * 100)}%`,
    };
  }).filter(p => p.name);

  $('#addPhone').addEventListener('click', () => {
    const list = [...readPhones(), ''];
    $('[data-rep="phones"]', form).innerHTML = phoneRows(list);
  });

  $('#addPartner').addEventListener('click', () => {
    const list = [...readPartners(), { name: '', rate: 0, months: [12], label: '0%' }];
    $('[data-rep="partners"]', form).innerHTML = partnerRows(list);
  });

  form.addEventListener('click', e => {
    const dp = e.target.closest('[data-del-phone]');
    if (dp) {
      const list = readPhones();
      list.splice(Number(dp.dataset.delPhone), 1);
      $('[data-rep="phones"]', form).innerHTML = phoneRows(list);
      return;
    }
    const dpa = e.target.closest('[data-del-partner]');
    if (dpa) {
      const list = readPartners();
      list.splice(Number(dpa.dataset.delPartner), 1);
      $('[data-rep="partners"]', form).innerHTML = partnerRows(list);
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors(form);

    const freeOver = numOr(val(form, 'freeShippingOver'), 0);
    const email = val(form, 'email').trim();
    let ok = true;
    if (!val(form, 'siteName').trim()) ok = setErr(form, 'siteName', u('required'));
    if (freeOver < 0) ok = setErr(form, 'freeShippingOver', u('errPrice'));
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) ok = setErr(form, 'email', u('required'));
    if (!ok) { focusFirstError(form); return; }

    const phones = readPhones();
    const partners = readPartners();

    S.update(s => {
      s.site.name = val(form, 'siteName').trim();
      s.site.nameKa = val(form, 'siteNameKa').trim();
      s.site.legal = val(form, 'legal').trim();
      s.site.taxId = val(form, 'taxId').trim();
      s.site.email = email;
      s.site.map = val(form, 'map').trim();
      s.site.address = readTri(form, 'address');
      s.site.hours = readTri(form, 'hours');
      s.site.phones = phones;

      s.settings.currency = val(form, 'currency').trim() || '₾';
      s.settings.freeShippingOver = Math.round(freeOver);
      s.settings.deliveryTbilisiHours = Math.round(numOr(val(form, 'deliveryTbilisiHours'), 3));
      s.settings.deliveryRegionsDays = Math.round(numOr(val(form, 'deliveryRegionsDays'), 2));
      s.settings.warrantyMonths = Math.round(numOr(val(form, 'warrantyMonths'), 12));
      s.settings.returnDays = Math.round(numOr(val(form, 'returnDays'), 14));
      s.settings.testBanner = checked(form, 'testBanner');

      if (partners.length) s.instalments = partners;
    }, 'update');

    toast(u('saved'));
  });

  /* ---- data panel ---- */

  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([S.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iland-cms-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast(u('exported'));
  });

  $('#importBtn').addEventListener('click', () => $('#importFile').click());

  $('#importFile').addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = S.importJSON(text);
    e.target.value = '';
    if (res.ok) toast(u('imported'));
    else toast(`${u('importFail')} — ${res.error}`, 'err');
  });

  $('#resetBtn').addEventListener('click', () => {
    if (!confirm(u('confirmReset'))) return;
    S.resetToFactory();
    toast(u('resetDone'));
  });
}

/* ==========================================================================
   Router + chrome
   ========================================================================== */

const SECTIONS = [
  { id: 'dashboard', icon: 'grid',    title: 'navDashboard', eyebrow: 'eyeDashboard', view: viewDashboard, wire: null },
  { id: 'products',  icon: 'box',     title: 'navProducts',  eyebrow: 'eyeProducts',  view: viewProducts,  wire: wireProducts, count: s => s.products.length },
  { id: 'banners',   icon: 'image',   title: 'navBanners',   eyebrow: 'eyeBanners',   view: viewBanners,   wire: wireBanners,  count: s => (s.banners || []).filter(b => b.active).length },
  { id: 'sales',     icon: 'tag',     title: 'navSales',     eyebrow: 'eyeSales',     view: viewSales,     wire: wireSales,    count: s => S.livePromos(s).length },
  { id: 'service',   icon: 'wrench',  title: 'navService',   eyebrow: 'eyeService',   view: viewService,   wire: wireService,  count: s => (s.services || []).length },
  { id: 'orders',    icon: 'receipt', title: 'navOrders',    eyebrow: 'eyeOrders',    view: viewOrders,    wire: wireOrders,   count: s => (s.orders || []).length },
  { id: 'settings',  icon: 'sliders', title: 'navSettings',  eyebrow: 'eyeSettings',  view: viewSettings,  wire: wireSettings },
];

const main = $('#adminMain');
let pendingFocus = null;

const currentSection = () => {
  const id = location.hash.replace(/^#\/?/, '').split('/')[0];
  return SECTIONS.find(s => s.id === id) || SECTIONS[0];
};

function renderNav() {
  const st = S.getState();
  $('#admNav').innerHTML = SECTIONS.map(s => {
    const n = s.count ? s.count(st) : null;
    return `
    <a href="#/${s.id}" data-sec="${s.id}">
      ${icon(s.icon, 17)}
      <span>${esc(u(s.title))}</span>
      ${n === null ? '' : `<span class="adm-nav__n num">${n}</span>`}
    </a>`;
  }).join('');
  markNav();
}

function markNav() {
  const cur = currentSection().id;
  $$('#admNav a').forEach(a => a.setAttribute('aria-current', a.dataset.sec === cur ? 'page' : 'false'));
}

function render() {
  const sec = currentSection();
  $('#admTitle').textContent = u(sec.title);
  $('#admEyebrow').textContent = u(sec.eyebrow);
  main.innerHTML = sec.view();
  sec.wire?.();
  renderNav();

  if (pendingFocus) {
    document.querySelector(pendingFocus)?.focus();
    pendingFocus = null;
  }
}

function applyTheme() {
  const th = S.getTheme();
  document.documentElement.dataset.theme = th;
  $('#themeIcon').innerHTML = th === 'dark'
    ? '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>'
    : '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>';
  $('meta[name=theme-color]')?.setAttribute('content', th === 'dark' ? '#04070C' : '#FBFAF7');
}

function applyLang() {
  const lang = S.getLang();
  document.documentElement.lang = lang;
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  document.title = `iLand — ${u('panel')}`;
  $('#admShopBtn').textContent = `${u('storefront')} →`;
  $('#admStorefront').textContent = `↗ ${u('storefront')}`;
  $('#admStamp').textContent = today();
  const s = S.getState().site;
  $('#admLegal').textContent = `${s.legal} · ${s.taxId}`;
}

function wireChrome() {
  $('#themeBtn').addEventListener('click', () => {
    S.setTheme(S.getTheme() === 'dark' ? 'light' : 'dark');
    applyTheme();
  });

  $$('.lang button').forEach(b => b.addEventListener('click', () => {
    S.setLang(b.dataset.lang);
    applyLang();
    render();
    if (sheet.open) sheet.close();   /* the open editor was built in the old language */
  }));

  addEventListener('hashchange', () => {
    if (sheet.open) sheet.close();
    render();
  });
}

function boot() {
  applyTheme();
  applyLang();
  wireChrome();
  if (!location.hash) location.hash = '#/dashboard';
  render();

  S.subscribe((_, reason) => {
    if (reason === 'cart') return;
    /* A save here, or an edit arriving from the storefront tab. The slide-over
       lives outside #adminMain, so repainting the section never disturbs it. */
    applyLang();
    render();
  });
}

boot();
