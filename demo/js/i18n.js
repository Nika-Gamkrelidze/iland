/* ==========================================================================
   iLand — UI strings
   Every visible string lives here, in all three languages. Nothing is baked
   into an image — which is the single biggest structural failure of the site
   this replaces (its hero headline was pixels inside a JPEG).
   ========================================================================== */

export const UI = {
  /* nav + chrome */
  search:        { ka: 'ძებნა',                       en: 'Search',                   ru: 'Поиск' },
  searchPh:      { ka: 'მოძებნე პროდუქტი…',            en: 'Search products…',         ru: 'Поиск товаров…' },
  noResults:     { ka: 'ვერაფერი მოიძებნა',           en: 'Nothing found',            ru: 'Ничего не найдено' },
  cart:          { ka: 'კალათა',                      en: 'Cart',                     ru: 'Корзина' },
  cartEmpty:     { ka: 'კალათა ცარიელია',             en: 'Your cart is empty',       ru: 'Корзина пуста' },
  cartEmptySub:  { ka: 'დაამატე პროდუქტი და დაუბრუნდი აქ.', en: 'Add something and come back.', ru: 'Добавьте товар и вернитесь.' },
  checkout:      { ka: 'შეკვეთის გაფორმება',          en: 'Checkout',                 ru: 'Оформить заказ' },
  total:         { ka: 'ჯამი',                        en: 'Total',                    ru: 'Итого' },
  remove:        { ka: 'წაშლა',                       en: 'Remove',                   ru: 'Удалить' },
  home:          { ka: 'მთავარი',                     en: 'Home',                     ru: 'Главная' },

  /* home */
  heroEyebrow:   { ka: 'ავტორიზებული გაყიდვა და სერვისი · ვაკე', en: 'Authorised sales and service · Vake', ru: 'Авторизованные продажи и сервис · Ваке' },
  heroTitleA:    { ka: 'Apple, ',                     en: 'Apple, ',                  ru: 'Apple, ' },
  heroTitleB:    { ka: 'გარკვევით.',                  en: 'made clear.',              ru: 'без тумана.' },
  heroLede: {
    ka: 'ერთი კურირებული თარო, გამოქვეყნებული ფასები და იგივე ხალხი, ვინც ყიდის — შეაკეთებს კიდეც. განვადება 0%-დან, თბილისში მიტანა 3 საათში.',
    en: 'One curated shelf, published prices, and the people who sell it are the people who repair it. Instalments from 0%, Tbilisi delivery in 3 hours.',
    ru: 'Одна выверенная полка, открытые цены, и те же люди, кто продаёт, — чинят. Рассрочка от 0%, доставка по Тбилиси за 3 часа.',
  },
  shopNow:       { ka: 'დაათვალიერე მაღაზია',         en: 'Shop the store',           ru: 'В магазин' },
  bookRepair:    { ka: 'შეაკეთე მოწყობილობა',         en: 'Book a repair',            ru: 'Записаться на ремонт' },

  statYears:     { ka: 'წელი ვაკეში',                 en: 'years in Vake',            ru: 'лет в Ваке' },
  statRepairs:   { ka: 'შეკეთებული მოწყობილობა',      en: 'devices repaired',         ru: 'устройств отремонтировано' },
  statWarranty:  { ka: 'თვე გარანტია',                en: 'month warranty',           ru: 'месяцев гарантии' },
  statDelivery:  { ka: 'საათში თბილისში',             en: 'hours in Tbilisi',         ru: 'часа по Тбилиси' },

  browse:        { ka: 'დაათვალიერე',                 en: 'Browse',                   ru: 'Каталог' },
  browseSub:     { ka: 'ყველა კატეგორია — ერთ თაროზე.', en: 'Every category, on one shelf.', ru: 'Все категории — на одной полке.' },
  featured:      { ka: 'შერჩეული',                    en: 'Featured',                 ru: 'Избранное' },
  featuredSub:   { ka: 'ის, რასაც ჩვენ თვითონ ვიყიდიდით.', en: 'What we would buy ourselves.', ru: 'То, что купили бы сами.' },
  deals:         { ka: 'ფასდაკლებები',                en: 'On sale',                  ru: 'Скидки' },
  dealsSub:      { ka: 'აქტიური კამპანიები, ნამდვილი ფასებით.', en: 'Live campaigns, real prices.', ru: 'Активные кампании, реальные цены.' },
  seeAll:        { ka: 'ყველას ნახვა',                en: 'See all',                  ru: 'Смотреть все' },
  items:         { ka: 'პროდუქტი',                    en: 'products',                 ru: 'товаров' },

  /* product */
  addToCart:     { ka: 'კალათაში დამატება',           en: 'Add to cart',              ru: 'В корзину' },
  added:         { ka: 'დაემატა კალათაში',            en: 'Added to cart',            ru: 'Добавлено в корзину' },
  outOfStock:    { ka: 'არ არის მარაგში',             en: 'Out of stock',             ru: 'Нет в наличии' },
  storage:       { ka: 'მეხსიერება',                  en: 'Storage',                  ru: 'Память' },
  colour:        { ka: 'ფერი',                        en: 'Finish',                   ru: 'Цвет' },
  condition:     { ka: 'მდგომარეობა',                 en: 'Condition',                ru: 'Состояние' },
  conditionNew:  { ka: 'ახალი',                       en: 'New',                      ru: 'Новый' },
  conditionDemo: { ka: 'DEMO',                        en: 'DEMO',                     ru: 'DEMO' },
  specs:         { ka: 'მახასიათებლები',              en: 'Specifications',           ru: 'Характеристики' },
  alsoBought:    { ka: 'ამასთან ერთად ყიდულობენ',     en: 'Often bought with',        ru: 'Часто покупают вместе' },
  sku:           { ka: 'კოდი',                        en: 'SKU',                      ru: 'Код' },

  /* instalments */
  instalment:    { ka: 'განვადება',                   en: 'Instalments',              ru: 'Рассрочка' },
  perMonth:      { ka: '₾ / თვეში',                   en: '₾ / month',                ru: '₾ / месяц' },
  months:        { ka: 'თვე',                         en: 'months',                   ru: 'мес.' },
  instalmentNote:{
    ka: 'გამოთვლა საორიენტაციოა. საბოლოო პირობებს ბანკი ამტკიცებს განაცხადის შემდეგ.',
    en: 'Indicative calculation. Final terms are approved by the bank after application.',
    ru: 'Расчёт ориентировочный. Итоговые условия утверждает банк после заявки.',
  },
  instalmentMin: {
    ka: 'ონლაინ განვადება მოქმედებს 100₾-დან.',
    en: 'Online instalments start from 100₾.',
    ru: 'Онлайн-рассрочка доступна от 100₾.',
  },

  /* trust */
  delivery:      { ka: 'მიტანა თბილისში',             en: 'Tbilisi delivery',         ru: 'Доставка по Тбилиси' },
  deliveryV:     { ka: '3 საათში, 200₾-დან უფასოდ',   en: 'In 3 hours, free over 200₾', ru: 'За 3 часа, от 200₾ бесплатно' },
  pickup:        { ka: 'აიღე მაღაზიიდან',             en: 'Store pickup',             ru: 'Самовывоз' },
  pickupV:       { ka: 'ვაკე, არაყიშვილის 2',         en: 'Vake, Arakishvili St. 2',  ru: 'Ваке, ул. Аракишвили 2' },
  warranty:      { ka: 'ოფიციალური გარანტია',         en: 'Official warranty',        ru: 'Официальная гарантия' },
  warrantyV:     { ka: '12 თვე, ჩვენს სერვისში',      en: '12 months, our own service', ru: '12 месяцев, свой сервис' },
  returns:       { ka: 'დაბრუნება',                   en: 'Returns',                  ru: 'Возврат' },
  returnsV:      { ka: '14 დღე, უკითხავად',           en: '14 days, no questions',    ru: '14 дней, без вопросов' },

  /* service */
  serviceTitle:  { ka: 'სერვისი, გამოქვეყნებული ფასებით', en: 'Service, with published prices', ru: 'Сервис с открытыми ценами' },
  serviceSub: {
    ka: 'საქართველოში ვერცერთი მაღაზია ვერ გეტყვის, რა ღირს ეკრანის შეცვლა, სანამ არ მიხვალ. ჩვენ გეუბნებით — აქვე.',
    en: 'No other shop in Georgia will tell you what a screen costs until you walk in. We tell you here.',
    ru: 'Ни один магазин в Грузии не назовёт цену экрана, пока вы не придёте. Мы называем — прямо здесь.',
  },
  from:          { ka: '-დან',                        en: 'from',                     ru: 'от' },
  turnaround:    { ka: 'ვადა',                        en: 'Turnaround',               ru: 'Срок' },
  svcWarranty:   { ka: 'გარანტია',                    en: 'Warranty',                 ru: 'Гарантия' },
  bookSlot:      { ka: 'დაჯავშნე დრო',                en: 'Book a slot',              ru: 'Записаться' },
  bookDevice:    { ka: 'რომელი მოწყობილობა?',          en: 'Which device?',            ru: 'Какое устройство?' },
  bookSlotLabel: { ka: 'აირჩიე დრო',                   en: 'Pick a time',              ru: 'Выберите время' },
  bookPhone:     { ka: 'ტელეფონი',                     en: 'Phone',                    ru: 'Телефон' },
  bookPhoneErr:  { ka: 'შეიყვანე სწორი ნომერი (9 ციფრი).', en: 'Enter a valid 9-digit number.', ru: 'Введите корректный номер (9 цифр).' },
  bookConfirm:   { ka: 'ჯავშნის დადასტურება',          en: 'Confirm booking',          ru: 'Подтвердить запись' },
  bookTitle:     { ka: 'სერვისზე ჩაწერა',              en: 'Book a repair',            ru: 'Запись в сервис' },
  free:          { ka: 'უფასო',                       en: 'Free',                     ru: 'Бесплатно' },
  monthsShort:   { ka: 'თვე',                         en: 'mo',                       ru: 'мес' },

  /* pinned story */
  storyEyebrow:  { ka: 'რატომ iLand',                 en: 'Why iLand',                ru: 'Почему iLand' },

  /* filters */
  all:           { ka: 'ყველა',                       en: 'All',                      ru: 'Все' },
  sortBy:        { ka: 'დალაგება',                    en: 'Sort',                     ru: 'Сортировка' },
  sortPopular:   { ka: 'პოპულარული',                  en: 'Popular',                  ru: 'Популярные' },
  sortPriceUp:   { ka: 'ფასი: ზრდადი',                en: 'Price: low to high',       ru: 'Цена: по возрастанию' },
  sortPriceDown: { ka: 'ფასი: კლებადი',               en: 'Price: high to low',       ru: 'Цена: по убыванию' },
  sortDiscount:  { ka: 'ფასდაკლება',                  en: 'Biggest discount',         ru: 'Скидка' },
  nothingHere:   { ka: 'ამ ფილტრით პროდუქტი არ არის.', en: 'No products match that filter.', ru: 'Нет товаров по фильтру.' },

  /* footer */
  footShop:      { ka: 'მაღაზია',                     en: 'Shop',                     ru: 'Магазин' },
  footHelp:      { ka: 'დახმარება',                   en: 'Help',                     ru: 'Помощь' },
  footCompany:   { ka: 'კომპანია',                    en: 'Company',                  ru: 'Компания' },
  footVisit:     { ka: 'მოგვინახულე',                 en: 'Visit us',                 ru: 'Приходите' },
  aboutUs:       { ka: 'ჩვენ შესახებ',                en: 'About us',                 ru: 'О нас' },
  terms:         { ka: 'პირობები',                    en: 'Terms',                    ru: 'Условия' },
  privacy:       { ka: 'კონფიდენციალურობა',           en: 'Privacy',                  ru: 'Конфиденциальность' },
  shipping:      { ka: 'მიტანა',                      en: 'Shipping',                 ru: 'Доставка' },
  rights:        { ka: 'ყველა უფლება დაცულია',        en: 'All rights reserved',      ru: 'Все права защищены' },
  openHours:     { ka: 'სამუშაო საათები',             en: 'Opening hours',            ru: 'Часы работы' },

  /* misc */
  demoNote:      { ka: 'დემო', en: 'Demo', ru: 'Демо' },
  adminLink:     { ka: 'ადმინი', en: 'Admin', ru: 'Админ' },
};

/* Marquee strip — the two things iLand sells hardest, plus the trust anchors. */
export const TICKER = [
  { ka: 'განვადება <b>0%-დან</b>',            en: 'Instalments <b>from 0%</b>',        ru: 'Рассрочка <b>от 0%</b>' },
  { ka: 'თბილისში მიტანა <b>3 საათში</b>',    en: '<b>3-hour</b> Tbilisi delivery',    ru: 'Доставка по Тбилиси <b>за 3 часа</b>' },
  { ka: '<b>ავტორიზებული</b> სერვისი ვაკეში', en: '<b>Authorised</b> service in Vake', ru: '<b>Авторизованный</b> сервис в Ваке' },
  { ka: 'გარანტია <b>12 თვე</b>',             en: '<b>12-month</b> warranty',          ru: 'Гарантия <b>12 месяцев</b>' },
  { ka: 'დიაგნოსტიკა <b>უფასოდ</b>',          en: '<b>Free</b> diagnostics',           ru: 'Диагностика <b>бесплатно</b>' },
  { ka: 'Trade-in <b>იმავე დღეს</b>',         en: '<b>Same-day</b> trade-in',          ru: 'Trade-in <b>в тот же день</b>' },
];

/* The pinned scroll story. Three panels, one device, one argument. */
export const STORY = [
  {
    device: 'macbook', color: '#2E2E30',
    h: { ka: 'ერთი თარო, კურირებული', en: 'One shelf, curated', ru: 'Одна полка, выверенная' },
    p: {
      ka: 'ჩვენ არ ვყიდით ყველაფერს. ვყიდით Apple-ს და იმას, რაც მას ნამდვილად ჭირდება — რომ არჩევანი გადაწყვეტილება იყოს და არა კვლევა.',
      en: 'We do not sell everything. We sell Apple and what genuinely serves it — so choosing is a decision, not a research project.',
      ru: 'Мы продаём не всё. Только Apple и то, что ему действительно нужно — чтобы выбор был решением, а не исследованием.',
    },
  },
  {
    device: 'iphone', color: '#D2653A',
    h: { ka: 'ფასი, რომელიც არ იმალება', en: 'A price that does not hide', ru: 'Цена, которая не прячется' },
    p: {
      ka: 'სრული ფასი, თვიური გადასახადი და ბანკის პირობა — ერთ ეკრანზე, სანამ კალათას გახსნი. ღილაკის მიღმა არაფერია.',
      en: 'Full price, the monthly figure and the bank terms — on one screen, before you open the cart. Nothing waits behind a button.',
      ru: 'Полная цена, ежемесячный платёж и условия банка — на одном экране, до корзины. Ничего не спрятано за кнопкой.',
    },
  },
  {
    device: 'watch', color: '#C2BCB2',
    h: { ka: 'ვინც გაყიდა, ის შეაკეთებს', en: 'Sold here, fixed here', ru: 'Продали здесь — чиним здесь' },
    p: {
      ka: 'ჩვენი სერვისი იმავე კართან არის, სადაც იყიდე. ეკრანი ერთ დღეში, ორიგინალი ნაწილით, წერილობითი დასკვნით.',
      en: 'Our workshop is behind the same door you bought from. Screen in a day, original part, written report.',
      ru: 'Наша мастерская — за той же дверью. Экран за день, оригинальная деталь, письменное заключение.',
    },
  },
];
