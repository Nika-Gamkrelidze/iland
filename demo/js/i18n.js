/* ==========================================================================
   NORVA — UI strings
   Every visible string lives here, in all three languages. Nothing is baked
   into an image, so every headline is translatable, searchable, responsive and
   readable to a screen reader.
   ========================================================================== */

export const UI = {
  /* nav + chrome */
  search:        { ka: 'ძებნა',                       en: 'Search',                   ru: 'Поиск' },
  searchPh:      { ka: 'მოძებნე პროდუქტი…',            en: 'Search products…',         ru: 'Поиск товаров…' },
  noResults:     { ka: 'ვერაფერი მოიძებნა',           en: 'Nothing found',            ru: 'Ничего не найдено' },
  cart:          { ka: 'კალათა',                      en: 'Cart',                     ru: 'Корзина' },
  cartEmpty:     { ka: 'კალათა ცარიელია',             en: 'Your cart is empty',       ru: 'Корзина пуста' },
  cartEmptySub:  { ka: 'დაამატე პროდუქტი და დაუბრუნდი აქ.', en: 'Add something and come back.', ru: 'Добавьте товар и вернитесь.' },
  checkout:      { ka: 'შეკვეთის გაფორმება',          en: 'Place the order',          ru: 'Оформить заказ' },
  total:         { ka: 'ჯამი',                        en: 'Total',                    ru: 'Итого' },
  remove:        { ka: 'წაშლა',                       en: 'Remove',                   ru: 'Удалить' },
  home:          { ka: 'მთავარი',                     en: 'Home',                     ru: 'Главная' },
  orderPlaced:   { ka: 'შეკვეთა №',                   en: 'Order #',                  ru: 'Заказ №' },
  orderPlacedSub:{ ka: 'გაფორმდა და გამოჩნდა CMS-ში', en: 'placed — it is now in the CMS', ru: 'оформлен и виден в CMS' },

  /* home */
  heroEyebrow:   { ka: 'გაყიდვა და სახელოსნო · საბურთალო', en: 'Sales and workshop · Saburtalo', ru: 'Продажи и мастерская · Сабуртало' },
  heroTitleA:    { ka: 'Apple, ',                     en: 'Apple, ',                  ru: 'Apple, ' },
  heroTitleB:    { ka: 'სტენდიდან.',                  en: 'off the bench.',           ru: 'со стенда.' },
  heroLede: {
    ka: 'ყოველი მოწყობილობა სტენდს გაივლის, სანამ ჩვენგან გავა. ფასი, თვიური და გარანტია — ერთ ეკრანზე, კალათამდე. თბილისში მიტანა 4 საათში.',
    en: 'Every device crosses the bench before it leaves us. Price, monthly figure and warranty on one screen, before the cart. Tbilisi delivery in four hours.',
    ru: 'Каждое устройство проходит стенд перед выдачей. Цена, платёж и гарантия — на одном экране, до корзины. Доставка по Тбилиси за четыре часа.',
  },
  shopNow:       { ka: 'დაათვალიერე მაღაზია',         en: 'Shop the store',           ru: 'В магазин' },
  bookRepair:    { ka: 'ჩაეწერე სახელოსნოში',         en: 'Book the workshop',        ru: 'Записаться в мастерскую' },

  statYears:     { ka: 'წელი სტენდთან',               en: 'years at the bench',       ru: 'лет у стенда' },
  statRepairs:   { ka: 'შეკეთებული მოწყობილობა',      en: 'devices repaired',         ru: 'устройств отремонтировано' },
  statWarranty:  { ka: 'თვე გარანტია',                en: 'month warranty',           ru: 'месяца гарантии' },
  statDelivery:  { ka: 'საათში თბილისში',             en: 'hours in Tbilisi',         ru: 'часа по Тбилиси' },

  browse:        { ka: 'დაათვალიერე',                 en: 'Browse',                   ru: 'Каталог' },
  browseSub:     { ka: 'ცხრა განყოფილება, ერთი კატალოგი.', en: 'Nine departments, one catalogue.', ru: 'Девять разделов, один каталог.' },
  featured:      { ka: 'შერჩეული',                    en: 'Picked by the bench',      ru: 'Выбор мастерской' },
  featuredSub:   { ka: 'ის, რასაც ჩვენი ტექნიკოსები თვითონ იყენებენ.', en: 'What our technicians run themselves.', ru: 'То, чем пользуются наши техники.' },
  deals:         { ka: 'ფასდაკლებები',                en: 'On sale',                  ru: 'Скидки' },
  dealsSub:      { ka: 'აქტიური კამპანიები, ნამდვილი ფასებით.', en: 'Live campaigns, honest prices.', ru: 'Активные кампании, честные цены.' },
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
  conditionOpen: { ka: 'გახსნილი ყუთი',               en: 'Open box',                 ru: 'Вскрытая упаковка' },
  specs:         { ka: 'მახასიათებლები',              en: 'Specifications',           ru: 'Характеристики' },
  alsoBought:    { ka: 'ამასთან ერთად ყიდულობენ',     en: 'Often bought with',        ru: 'Часто покупают вместе' },
  sku:           { ka: 'კოდი',                        en: 'SKU',                      ru: 'Код' },

  /* instalments */
  instalment:    { ka: 'განვადება',                   en: 'Instalments',              ru: 'Рассрочка' },
  perMonth:      { ka: '₾ / თვეში',                   en: '₾ / month',                ru: '₾ / месяц' },
  months:        { ka: 'თვე',                         en: 'months',                   ru: 'мес.' },
  instalmentNote:{
    ka: 'გამოთვლა საორიენტაციოა და დემოს ნაწილია. პარტნიორები მოგონილია.',
    en: 'The calculation is indicative and part of the demo. The lenders are invented.',
    ru: 'Расчёт ориентировочный и является частью демо. Партнёры вымышлены.',
  },

  /* trust */
  delivery:      { ka: 'მიტანა თბილისში',             en: 'Tbilisi delivery',         ru: 'Доставка по Тбилиси' },
  deliveryV:     { ka: '4 საათში, 250₾-დან უფასოდ',   en: 'In 4 hours, free over 250₾', ru: 'За 4 часа, от 250₾ бесплатно' },
  pickup:        { ka: 'აიღე მაღაზიიდან',             en: 'Store pickup',             ru: 'Самовывоз' },
  pickupV:       { ka: 'საბურთალო, ქარვასლის 8',      en: 'Saburtalo, 8 Karvasla St.', ru: 'Сабуртало, ул. Карвасла 8' },
  warranty:      { ka: 'ოფიციალური გარანტია',         en: 'Official warranty',        ru: 'Официальная гарантия' },
  warrantyV:     { ka: '24 თვე, ჩვენივე სახელოსნოში', en: '24 months, our own workshop', ru: '24 месяца, своя мастерская' },
  returns:       { ka: 'დაბრუნება',                   en: 'Returns',                  ru: 'Возврат' },
  returnsV:      { ka: '21 დღე, უკითხავად',           en: '21 days, no questions',    ru: '21 день, без вопросов' },

  /* workshop */
  serviceTitle:  { ka: 'სახელოსნო, გამოქვეყნებული ფასებით', en: 'The workshop, with prices up front', ru: 'Мастерская с ценами наперёд' },
  serviceSub: {
    ka: 'ყოველი სამუშაოს ფასი, ვადა და გარანტია აქვე წერია — სანამ მოწყობილობას მოიტან.',
    en: 'Every job lists its price, its turnaround and its warranty right here, before you bring the device in.',
    ru: 'Цена, срок и гарантия каждой работы указаны здесь — до того, как вы принесёте устройство.',
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
  bookTitle:     { ka: 'სახელოსნოში ჩაწერა',           en: 'Book the workshop',        ru: 'Запись в мастерскую' },
  free:          { ka: 'უფასო',                       en: 'Free',                     ru: 'Бесплатно' },
  monthsShort:   { ka: 'თვე',                         en: 'mo',                       ru: 'мес' },

  /* pinned story */
  storyEyebrow:  { ka: 'რატომ NORVA',                 en: 'Why NORVA',                ru: 'Почему NORVA' },

  /* filters + paging */
  all:           { ka: 'ყველა',                       en: 'All',                      ru: 'Все' },
  sortBy:        { ka: 'დალაგება',                    en: 'Sort',                     ru: 'Сортировка' },
  sortPopular:   { ka: 'პოპულარული',                  en: 'Popular',                  ru: 'Популярные' },
  sortPriceUp:   { ka: 'ფასი: ზრდადი',                en: 'Price: low to high',       ru: 'Цена: по возрастанию' },
  sortPriceDown: { ka: 'ფასი: კლებადი',               en: 'Price: high to low',       ru: 'Цена: по убыванию' },
  sortDiscount:  { ka: 'ფასდაკლება',                  en: 'Biggest discount',         ru: 'Скидка' },
  nothingHere:   { ka: 'ამ ფილტრით პროდუქტი არ არის.', en: 'No products match that filter.', ru: 'Нет товаров по фильтру.' },
  prevPage:      { ka: 'წინა',                        en: 'Previous',                 ru: 'Назад' },
  nextPage:      { ka: 'შემდეგი',                     en: 'Next',                     ru: 'Вперёд' },
  pageOf:        { ka: 'გვერდი',                      en: 'Page',                     ru: 'Страница' },
  pageSep:       { ka: '/',                           en: 'of',                       ru: 'из' },

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
  adminLink:     { ka: 'CMS', en: 'CMS', ru: 'CMS' },
};

/* Marquee strip — the promises the shop leads with. */
export const TICKER = [
  { ka: 'განვადება <b>0%-დან</b>',              en: 'Instalments <b>from 0%</b>',         ru: 'Рассрочка <b>от 0%</b>' },
  { ka: 'თბილისში მიტანა <b>4 საათში</b>',      en: '<b>Four-hour</b> Tbilisi delivery',  ru: 'Доставка по Тбилиси <b>за 4 часа</b>' },
  { ka: 'ყოველი მოწყობილობა <b>სტენდზე</b>',    en: 'Every device <b>bench-tested</b>',   ru: 'Каждое устройство <b>со стенда</b>' },
  { ka: 'გარანტია <b>24 თვე</b>',               en: '<b>24-month</b> warranty',           ru: 'Гарантия <b>24 месяца</b>' },
  { ka: 'სტენდის შემოწმება <b>უფასოდ</b>',      en: '<b>Free</b> bench check',            ru: 'Стендовая проверка <b>бесплатно</b>' },
  { ka: 'გამოსყიდვა <b>იმავე ვიზიტზე</b>',      en: 'Buy-back <b>on the same visit</b>',  ru: 'Выкуп <b>в тот же визит</b>' },
];

/* The pinned scroll story. Three panels, one device, one argument. */
export const STORY = [
  {
    device: 'laptop', color: '#3A3D42',
    h: { ka: 'ყველაფერი გაივლის სტენდს', en: 'Everything crosses the bench', ru: 'Всё проходит стенд' },
    p: {
      ka: 'გაყიდვამდე ყოველი მოწყობილობა იხსნება, ახლდება და მოწმდება 41 პუნქტით. ყუთი დალუქულია — ჩვენი დასკვნა კი თან ახლავს.',
      en: 'Before it is sold, every device is opened, updated and run through a 41-point check. The box is sealed; our report travels with it.',
      ru: 'Перед продажей каждое устройство вскрывают, обновляют и проверяют по 41 пункту. Коробка запечатана, а отчёт идёт вместе с ней.',
    },
  },
  {
    device: 'phone', color: '#4A5A6E',
    h: { ka: 'ფასი, რომელიც არ იმალება', en: 'A price that does not hide', ru: 'Цена, которая не прячется' },
    p: {
      ka: 'სრული ფასი, თვიური გადასახადი და პირობები — ერთ ეკრანზე, სანამ კალათას გახსნი. ღილაკის მიღმა არაფერია.',
      en: 'Full price, the monthly figure and the terms — on one screen, before you open the cart. Nothing waits behind a button.',
      ru: 'Полная цена, ежемесячный платёж и условия — на одном экране, до корзины. Ничего не спрятано за кнопкой.',
    },
  },
  {
    device: 'watch', color: '#C9B79E',
    h: { ka: 'ვინც გაყიდა, ის შეაკეთებს', en: 'Sold here, fixed here', ru: 'Продали здесь — чиним здесь' },
    p: {
      ka: 'სახელოსნო იმავე კართან არის, სადაც იყიდე. ეკრანი ოთხ საათში, დალუქული ნაწილით, წერილობითი დასკვნით.',
      en: 'The workshop is behind the same door you bought from. Display in four hours, sealed part, written report.',
      ru: 'Мастерская — за той же дверью. Дисплей за четыре часа, запечатанная деталь, письменное заключение.',
    },
  },
];
