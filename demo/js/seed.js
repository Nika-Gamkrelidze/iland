/* ==========================================================================
   iLand — seed catalogue
   Real categories, product names and price points observed on iland.ge.
   Prices are in GEL (₾). This file is the *factory default*; the CMS writes
   its own copy into localStorage and the storefront reads that.
   ========================================================================== */

export const SITE = {
  name: 'iLand',
  nameKa: 'აილენდი',
  legal: 'შპს აიფოუნს.ჯი',
  taxId: '204571604',
  email: 'info@iland.ge',
  phones: ['(032) 2 228080', '(032) 2 999993'],
  address: {
    ka: 'თბილისი, ვაკე, არაყიშვილის 2',
    en: 'Arakishvili St. 2, Vake, Tbilisi',
    ru: 'ул. Аракишвили 2, Ваке, Тбилиси',
  },
  hours: { ka: 'ორშ – კვი · 10:00 – 21:00', en: 'Mon – Sun · 10:00 – 21:00', ru: 'Пн – Вс · 10:00 – 21:00' },
  map: 'https://goo.gl/maps/fVLkCQ7HV9WjZ7w6A',
  social: {
    facebook: 'https://www.facebook.com/iland.ge',
    instagram: 'https://www.instagram.com/iland.ge',
    youtube: 'https://www.youtube.com/@iland.ge',
  },
};

export const CATEGORIES = [
  { id: 'iphone',      ka: 'iPhone',        en: 'iPhone',      ru: 'iPhone',        icon: 'iphone',  order: 1 },
  { id: 'ipad',        ka: 'iPad',          en: 'iPad',        ru: 'iPad',          icon: 'ipad',    order: 2 },
  { id: 'mac',         ka: 'Mac',           en: 'Mac',         ru: 'Mac',           icon: 'mac',     order: 3 },
  { id: 'watch',       ka: 'Watch',         en: 'Watch',       ru: 'Watch',         icon: 'watch',   order: 4 },
  { id: 'tv',          ka: 'TV',            en: 'TV',          ru: 'TV',            icon: 'tv',      order: 5 },
  { id: 'accessories', ka: 'აქსესუარები',   en: 'Accessories', ru: 'Аксессуары',    icon: 'acc',     order: 6 },
  { id: 'service',     ka: 'სერვისი',       en: 'Service',     ru: 'Сервис',        icon: 'service', order: 7 },
  { id: 'gifts',       ka: 'Gift Cards',    en: 'Gift Cards',  ru: 'Gift Cards',    icon: 'gift',    order: 8 },
];

export const ACCESSORY_GROUPS = [
  'Made by Apple', 'Chargers & Cables', 'Headphones', 'Home & Speakers',
  'Holders & Vlog', 'Mice & Keyboard', 'AirTag & Accessories',
  'Screen Protectors', 'Software', 'Games for Mac', 'Car Gadgets',
];

/* Colour swatches reused across products — hex is the real device finish. */
export const FINISHES = {
  naturalTitanium:  { id: 'natural-titanium',  en: 'Natural Titanium',  ka: 'ნატურალური ტიტანი',   hex: '#C2BCB2' },
  blueTitanium:     { id: 'blue-titanium',     en: 'Blue Titanium',     ka: 'ლურჯი ტიტანი',        hex: '#4E5D6C' },
  blackTitanium:    { id: 'black-titanium',    en: 'Black Titanium',    ka: 'შავი ტიტანი',         hex: '#3B3B3D' },
  whiteTitanium:    { id: 'white-titanium',    en: 'White Titanium',    ka: 'თეთრი ტიტანი',        hex: '#F0EFEA' },
  desertTitanium:   { id: 'desert-titanium',   en: 'Desert Titanium',   ka: 'უდაბნოს ტიტანი',      hex: '#BFA48F' },
  cosmicOrange:     { id: 'cosmic-orange',     en: 'Cosmic Orange',     ka: 'კოსმოსური ნარინჯი',   hex: '#D2653A' },
  deepBlue:         { id: 'deep-blue',         en: 'Deep Blue',         ka: 'ღრმა ლურჯი',          hex: '#2C3D57' },
  silver:           { id: 'silver',            en: 'Silver',            ka: 'ვერცხლისფერი',        hex: '#E3E4E5' },
  spaceBlack:       { id: 'space-black',       en: 'Space Black',       ka: 'კოსმოსური შავი',      hex: '#2E2E30' },
  midnight:         { id: 'midnight',          en: 'Midnight',          ka: 'შუაღამე',             hex: '#2A2E33' },
  starlight:        { id: 'starlight',         en: 'Starlight',         ka: 'ვარსკვლავური',        hex: '#F0E4D3' },
  skyBlue:          { id: 'sky-blue',          en: 'Sky Blue',          ka: 'ცისფერი',             hex: '#A7C4D9' },
  pink:             { id: 'pink',              en: 'Pink',              ka: 'ვარდისფერი',          hex: '#E5C6CB' },
  ultramarine:      { id: 'ultramarine',       en: 'Ultramarine',       ka: 'ულტრამარინი',         hex: '#5A6FB0' },
  teal:             { id: 'teal',              en: 'Teal',              ka: 'ზურმუხტისფერი',       hex: '#8FBEB5' },
  jetBlack:         { id: 'jet-black',         en: 'Jet Black',         ka: 'ღრმა შავი',           hex: '#1C1C1E' },
  spaceGray:        { id: 'space-gray',        en: 'Space Gray',        ka: 'კოსმოსური რუხი',      hex: '#7D7E80' },
  white:            { id: 'white',             en: 'White',             ka: 'თეთრი',               hex: '#F5F5F7' },
};

const f = (...keys) => keys.map(k => FINISHES[k]);

/* Storage tiers: [label, priceDeltaGEL] */
const S = (...pairs) => pairs.map(([size, delta]) => ({ size, delta }));

export const PRODUCTS = [
  /* ---------------------------------------------------------------- iPhone */
  {
    id: 'iphone-17-pro', sku: 'IP17P', category: 'iphone', device: 'iphone',
    image: 'assets/products/iphone-17-pro.jpg',
    name: 'iPhone 17 Pro',
    tagline: { ka: 'ტიტანი. A19 Pro. ყოველდღიური ძალა.', en: 'Titanium. A19 Pro. Everyday power.', ru: 'Титан. A19 Pro. Мощность каждый день.' },
    price: 3199, oldPrice: 3779, condition: 'new', badge: 'new', featured: true, rating: 4.9, reviews: 128,
    storage: S(['256GB', 0], ['512GB', 560], ['1TB', 1120], ['2TB', 2240]),
    colors: f('cosmicOrange', 'deepBlue', 'silver'),
    stock: 12,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '6.3" Super Retina XDR, 120Hz' },
      { ka: 'ჩიპი', en: 'Chip', v: 'A19 Pro' },
      { ka: 'კამერა', en: 'Camera', v: '48MP Fusion · 48MP Ultra Wide · 48MP Tele' },
      { ka: 'ბატარეა', en: 'Battery', v: 'up to 33h video' },
      { ka: 'მასალა', en: 'Material', v: 'Aluminium unibody · Ceramic Shield 2' },
    ],
  },
  {
    id: 'iphone-air', sku: 'IPAIR', category: 'iphone', device: 'iphone',
    image: 'assets/products/iphone-air.png',
    name: 'iPhone Air',
    tagline: { ka: 'ყველაზე თხელი iPhone.', en: 'The thinnest iPhone ever.', ru: 'Самый тонкий iPhone.' },
    price: 2749, oldPrice: 3099, condition: 'new', badge: 'new', featured: true, rating: 4.8, reviews: 74,
    storage: S(['256GB', 0], ['512GB', 560], ['1TB', 1120]),
    colors: f('skyBlue', 'starlight', 'spaceBlack'),
    stock: 7,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '6.5" Super Retina XDR, 120Hz' },
      { ka: 'ჩიპი', en: 'Chip', v: 'A19 Pro' },
      { ka: 'სისქე', en: 'Thickness', v: '5.6 mm' },
      { ka: 'კამერა', en: 'Camera', v: '48MP Fusion' },
    ],
  },
  {
    id: 'iphone-17', sku: 'IP17', category: 'iphone', device: 'iphone',
    image: 'assets/products/iphone-17.jpg',
    name: 'iPhone 17',
    tagline: { ka: 'უფრო ნათელი. უფრო სწრაფი.', en: 'Brighter. Faster.', ru: 'Ярче. Быстрее.' },
    price: 2299, oldPrice: 2599, condition: 'new', badge: 'new', featured: true, rating: 4.8, reviews: 203,
    storage: S(['256GB', 0], ['512GB', 560]),
    colors: f('ultramarine', 'teal', 'white', 'midnight'),
    stock: 21,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '6.3" Super Retina XDR, 120Hz' },
      { ka: 'ჩიპი', en: 'Chip', v: 'A19' },
      { ka: 'კამერა', en: 'Camera', v: '48MP Dual Fusion' },
    ],
  },
  {
    id: 'iphone-16-pro', sku: 'IP16P', category: 'iphone', device: 'iphone',
    image: 'assets/products/iphone-16-pro.jpg',
    name: 'iPhone 16 Pro',
    tagline: { ka: 'ტიტანის კორპუსი, Camera Control.', en: 'Titanium body, Camera Control.', ru: 'Титановый корпус, Camera Control.' },
    price: 2549, oldPrice: 3099, condition: 'new', badge: 'sale', rating: 4.9, reviews: 341,
    storage: S(['128GB', 0], ['256GB', 280], ['512GB', 840], ['1TB', 1400]),
    colors: f('desertTitanium', 'naturalTitanium', 'blueTitanium', 'blackTitanium'),
    stock: 9,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '6.3" Super Retina XDR, 120Hz' },
      { ka: 'ჩიპი', en: 'Chip', v: 'A18 Pro' },
      { ka: 'კამერა', en: 'Camera', v: '48MP Fusion · 5× Tele' },
    ],
  },
  {
    id: 'iphone-16', sku: 'IP16', category: 'iphone', device: 'iphone',
    image: 'assets/products/iphone-16.jpg',
    name: 'iPhone 16',
    tagline: { ka: 'Apple Intelligence-ისთვის შექმნილი.', en: 'Built for Apple Intelligence.', ru: 'Создан для Apple Intelligence.' },
    price: 1899, oldPrice: 2299, condition: 'new', badge: 'sale', rating: 4.7, reviews: 512,
    storage: S(['128GB', 0], ['256GB', 280], ['512GB', 840]),
    colors: f('midnight', 'ultramarine', 'teal', 'pink', 'white'),
    stock: 34,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '6.1" Super Retina XDR' },
      { ka: 'ჩიპი', en: 'Chip', v: 'A18' },
      { ka: 'კამერა', en: 'Camera', v: '48MP Fusion · 12MP Ultra Wide' },
    ],
  },
  {
    id: 'iphone-15', sku: 'IP15', category: 'iphone', device: 'iphone',
    image: 'assets/products/iphone-15.jpg',
    name: 'iPhone 15',
    tagline: { ka: 'Dynamic Island. USB-C.', en: 'Dynamic Island. USB-C.', ru: 'Dynamic Island. USB-C.' },
    price: 1369, oldPrice: 1799, condition: 'new', badge: 'sale', featured: true, rating: 4.7, reviews: 890,
    storage: S(['128GB', 0], ['256GB', 280], ['512GB', 840]),
    colors: f('pink', 'teal', 'starlight', 'midnight'),
    stock: 18,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '6.1" Super Retina XDR' },
      { ka: 'ჩიპი', en: 'Chip', v: 'A16 Bionic' },
      { ka: 'კამერა', en: 'Camera', v: '48MP Main · 12MP Ultra Wide' },
    ],
  },
  {
    id: 'iphone-14', sku: 'IP14', category: 'iphone', device: 'iphone',
    image: 'assets/products/iphone-14.png',
    name: 'iPhone 14',
    tagline: { ka: 'დამტკიცებული კლასიკა.', en: 'A proven classic.', ru: 'Проверенная классика.' },
    price: 1149, oldPrice: 1479, condition: 'demo', badge: 'demo', rating: 4.6, reviews: 402,
    storage: S(['128GB', 0], ['256GB', 260]),
    colors: f('midnight', 'starlight', 'skyBlue'),
    stock: 4,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '6.1" Super Retina XDR' },
      { ka: 'ჩიპი', en: 'Chip', v: 'A15 Bionic' },
    ],
  },

  /* ------------------------------------------------------------------ iPad */
  {
    id: 'ipad-pro-m4', sku: 'IPDPM4', category: 'ipad', device: 'ipad',
    image: 'assets/products/ipad-pro-m4.jpg',
    name: 'iPad Pro M4',
    tagline: { ka: 'Ultra Retina XDR. წარმოუდგენლად თხელი.', en: 'Ultra Retina XDR. Impossibly thin.', ru: 'Ultra Retina XDR. Невероятно тонкий.' },
    price: 3449, oldPrice: 3899, condition: 'new', badge: 'new', featured: true, rating: 4.9, reviews: 96,
    storage: S(['256GB', 0], ['512GB', 560], ['1TB', 1400], ['2TB', 2520]),
    colors: f('spaceBlack', 'silver'),
    stock: 6,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '13" Ultra Retina XDR, tandem OLED' },
      { ka: 'ჩიპი', en: 'Chip', v: 'Apple M4' },
      { ka: 'სისქე', en: 'Thickness', v: '5.1 mm' },
    ],
  },
  {
    id: 'ipad-air-m3', sku: 'IPDAM3', category: 'ipad', device: 'ipad',
    image: 'assets/products/ipad-air-m3.jpg',
    name: 'iPad Air M3',
    tagline: { ka: 'სერიოზული ძალა, მსუბუქ კორპუსში.', en: 'Serious power, feather light.', ru: 'Серьёзная мощь в лёгком корпусе.' },
    price: 1849, oldPrice: 2149, condition: 'new', badge: 'sale', rating: 4.8, reviews: 154,
    storage: S(['128GB', 0], ['256GB', 300], ['512GB', 900]),
    colors: f('spaceGray', 'starlight', 'skyBlue', 'pink'),
    stock: 14,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '11" Liquid Retina' },
      { ka: 'ჩიპი', en: 'Chip', v: 'Apple M3' },
    ],
  },
  {
    id: 'ipad-11', sku: 'IPD11', category: 'ipad', device: 'ipad',
    image: 'assets/products/ipad-11.jpg',
    name: 'iPad',
    tagline: { ka: 'ყველაფერი, რაც გჭირდება.', en: 'Everything you need.', ru: 'Всё, что нужно.' },
    price: 949, oldPrice: 1149, condition: 'new', badge: 'sale', rating: 4.6, reviews: 288,
    storage: S(['128GB', 0], ['256GB', 260]),
    colors: f('skyBlue', 'silver', 'pink', 'starlight'),
    stock: 25,
    specs: [{ ka: 'ეკრანი', en: 'Display', v: '11" Liquid Retina' }, { ka: 'ჩიპი', en: 'Chip', v: 'A16' }],
  },

  /* ------------------------------------------------------------------- Mac */
  {
    id: 'macbook-pro-14', sku: 'MBP14', category: 'mac', device: 'macbook',
    image: 'assets/products/macbook-pro-14.jpg',
    name: 'MacBook Pro 14"',
    tagline: { ka: 'M4 Pro. სამუშაო, რომელიც არ ჩერდება.', en: 'M4 Pro. Work that never stalls.', ru: 'M4 Pro. Работа без остановок.' },
    price: 4779, oldPrice: 5499, condition: 'new', badge: 'sale', featured: true, rating: 4.9, reviews: 167,
    storage: S(['512GB', 0], ['1TB', 700], ['2TB', 1960]),
    colors: f('spaceBlack', 'silver'),
    stock: 5,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '14.2" Liquid Retina XDR, 120Hz' },
      { ka: 'ჩიპი', en: 'Chip', v: 'Apple M4 Pro · 12-core CPU' },
      { ka: 'მეხსიერება', en: 'Memory', v: '24GB unified' },
      { ka: 'ბატარეა', en: 'Battery', v: 'up to 22h' },
    ],
  },
  {
    id: 'macbook-air-15', sku: 'MBA15', category: 'mac', device: 'macbook',
    image: 'assets/products/macbook-air-15.jpg',
    name: 'MacBook Air 15"',
    tagline: { ka: 'დიდი ეკრანი. 1.5 კგ.', en: 'Big screen. 1.5 kg.', ru: 'Большой экран. 1,5 кг.' },
    price: 2649, oldPrice: 2999, condition: 'new', badge: 'bestseller', featured: true, rating: 4.9, reviews: 431,
    storage: S(['256GB', 0], ['512GB', 560], ['1TB', 1120]),
    colors: f('silver', 'midnight', 'starlight', 'skyBlue'),
    stock: 16,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '15.3" Liquid Retina' },
      { ka: 'ჩიპი', en: 'Chip', v: 'Apple M4 · 10-core CPU' },
      { ka: 'ბატარეა', en: 'Battery', v: 'up to 18h' },
      { ka: 'წონა', en: 'Weight', v: '1.51 kg' },
    ],
  },
  {
    id: 'imac-24', sku: 'IMAC24', category: 'mac', device: 'imac',
    image: 'assets/products/imac-24.jpg',
    name: 'iMac 24"',
    tagline: { ka: 'ფერადი. სრულყოფილი. ერთ ცალში.', en: 'Colourful. Complete. All in one.', ru: 'Яркий. Цельный. Всё в одном.' },
    price: 4249, oldPrice: 4979, condition: 'new', badge: 'sale', rating: 4.8, reviews: 89,
    storage: S(['256GB', 0], ['512GB', 560]),
    colors: f('skyBlue', 'pink', 'teal', 'silver'),
    stock: 3,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '24" 4.5K Retina' },
      { ka: 'ჩიპი', en: 'Chip', v: 'Apple M4' },
    ],
  },
  {
    id: 'mac-mini-m4', sku: 'MMINI', category: 'mac', device: 'macmini',
    image: 'assets/products/mac-mini-m4.jpg',
    name: 'Mac mini M4',
    tagline: { ka: 'პატარა კორპუსი. სრული Mac.', en: 'Tiny box. Whole Mac.', ru: 'Маленький корпус. Полноценный Mac.' },
    price: 1699, oldPrice: 2179, condition: 'new', badge: 'sale', rating: 4.9, reviews: 212,
    storage: S(['256GB', 0], ['512GB', 560], ['1TB', 1120]),
    colors: f('silver'),
    stock: 11,
    specs: [{ ka: 'ჩიპი', en: 'Chip', v: 'Apple M4' }, { ka: 'ზომა', en: 'Size', v: '12.7 × 12.7 cm' }],
  },

  /* ----------------------------------------------------------------- Watch */
  {
    id: 'watch-ultra-3', sku: 'AWU3', category: 'watch', device: 'watch',
    name: 'Apple Watch Ultra 3',
    tagline: { ka: 'ტიტანი. სატელიტი. უსაზღვრო.', en: 'Titanium. Satellite. Limitless.', ru: 'Титан. Спутник. Без границ.' },
    price: 2449, oldPrice: 2749, condition: 'new', badge: 'new', featured: true, rating: 4.9, reviews: 63,
    storage: S(['49mm', 0]),
    colors: f('naturalTitanium', 'blackTitanium'),
    stock: 8,
    specs: [
      { ka: 'ეკრანი', en: 'Display', v: '49mm LTPO3 OLED, 3000 nits' },
      { ka: 'ბატარეა', en: 'Battery', v: 'up to 42h' },
      { ka: 'წყალი', en: 'Water', v: '100 m · EN13319' },
    ],
  },
  {
    id: 'watch-series-11', sku: 'AWS11', category: 'watch', device: 'watch',
    name: 'Apple Watch Series 11',
    tagline: { ka: 'ჯანმრთელობა, მაჯაზე.', en: 'Health, on the wrist.', ru: 'Здоровье на запястье.' },
    price: 1149, oldPrice: 1349, condition: 'new', badge: 'sale', rating: 4.8, reviews: 197,
    storage: S(['42mm', 0], ['46mm', 120]),
    colors: f('jetBlack', 'silver', 'starlight'),
    stock: 22,
    specs: [{ ka: 'ეკრანი', en: 'Display', v: 'Always-On Retina' }, { ka: 'სენსორები', en: 'Sensors', v: 'ECG · SpO₂ · Sleep score' }],
  },
  {
    id: 'watch-se-3', sku: 'AWSE3', category: 'watch', device: 'watch',
    name: 'Apple Watch SE 3',
    tagline: { ka: 'შესვლის საუკეთესო წერტილი.', en: 'The best way in.', ru: 'Лучшая точка входа.' },
    price: 679, oldPrice: 799, condition: 'new', badge: null, rating: 4.7, reviews: 254,
    storage: S(['40mm', 0], ['44mm', 100]),
    colors: f('midnight', 'starlight'),
    stock: 30,
    specs: [{ ka: 'ჩიპი', en: 'Chip', v: 'S10 SiP' }],
  },

  /* -------------------------------------------------------------------- TV */
  {
    id: 'apple-tv-4k', sku: 'ATV4K', category: 'tv', device: 'appletv',
    name: 'Apple TV 4K',
    tagline: { ka: 'კინო, სახლში.', en: 'Cinema, at home.', ru: 'Кино у вас дома.' },
    price: 549, oldPrice: 649, condition: 'new', badge: 'sale', rating: 4.8, reviews: 143,
    storage: S(['64GB', 0], ['128GB', 120]),
    colors: f('jetBlack'),
    stock: 19,
    specs: [{ ka: 'ჩიპი', en: 'Chip', v: 'A17 Pro' }, { ka: 'ვიდეო', en: 'Video', v: '4K Dolby Vision · HDR10+' }],
  },
  {
    id: 'homepod-mini', sku: 'HPMINI', category: 'tv', device: 'homepod',
    name: 'HomePod mini',
    tagline: { ka: 'დიდი ხმა, პატარა სფეროდან.', en: 'Big sound, small sphere.', ru: 'Большой звук в малом шаре.' },
    price: 299, oldPrice: 349, condition: 'new', badge: null, rating: 4.6, reviews: 176,
    storage: S(['—', 0]),
    colors: f('midnight', 'white', 'teal', 'pink'),
    stock: 27,
    specs: [{ ka: 'ხმა', en: 'Audio', v: 'Computational audio · 360°' }],
  },

  /* ----------------------------------------------------------- Accessories */
  {
    id: 'airpods-pro-3', sku: 'APP3', category: 'accessories', group: 'Made by Apple', device: 'airpods',
    name: 'AirPods Pro 3',
    tagline: { ka: 'ხმაურის ჩახშობა, ახალ დონეზე.', en: 'Noise cancellation, next level.', ru: 'Шумоподавление нового уровня.' },
    price: 749, oldPrice: 869, condition: 'new', badge: 'bestseller', featured: true, rating: 4.9, reviews: 508,
    storage: S(['—', 0]), colors: f('white'), stock: 41,
    specs: [{ ka: 'ANC', en: 'ANC', v: '2× vs previous' }, { ka: 'ბატარეა', en: 'Battery', v: '8h + 30h case' }],
  },
  {
    id: 'magsafe-charger', sku: 'MGSF', category: 'accessories', group: 'Chargers & Cables', device: 'accessory',
    name: 'MagSafe Charger 25W',
    tagline: { ka: 'მიაკარი და დაიმუხტე.', en: 'Snap on and charge.', ru: 'Приложи и заряжай.' },
    price: 129, oldPrice: 159, condition: 'new', badge: null, rating: 4.5, reviews: 233,
    storage: S(['1m', 0], ['2m', 30]), colors: f('white'), stock: 56,
    specs: [{ ka: 'სიმძლავრე', en: 'Power', v: '25W with 30W adapter' }],
  },
  {
    id: 'usbc-lightning', sku: 'CBLCL', category: 'accessories', group: 'Chargers & Cables', device: 'accessory',
    name: 'USB-C to Lightning Cable',
    tagline: { ka: 'ორიგინალი, 1 მეტრი.', en: 'Original, 1 metre.', ru: 'Оригинал, 1 метр.' },
    price: 99, oldPrice: 119, condition: 'new', badge: null, rating: 4.4, reviews: 121,
    storage: S(['1m', 0], ['2m', 40]), colors: f('white'), stock: 88,
    specs: [{ ka: 'სტანდარტი', en: 'Standard', v: 'USB-C · MFi certified' }],
  },
  {
    id: 'screen-protector', sku: 'SCPRT', category: 'accessories', group: 'Screen Protectors', device: 'accessory',
    name: 'iPhone Screen Protector with Airbag',
    tagline: { ka: 'დაცვა კუთხეებში დარტყმისგან.', en: 'Corner-impact protection.', ru: 'Защита от ударов по углам.' },
    price: 19, oldPrice: 29, condition: 'new', badge: 'sale', rating: 4.3, reviews: 364,
    storage: S(['—', 0]), colors: f('white'), stock: 140,
    specs: [{ ka: 'სისალე', en: 'Hardness', v: '9H tempered glass' }],
  },
  {
    id: 'airtag-4pack', sku: 'ATAG4', category: 'accessories', group: 'AirTag & Accessories', device: 'accessory',
    name: 'AirTag (4 pack)',
    tagline: { ka: 'აღარაფერი დაიკარგება.', en: 'Nothing gets lost again.', ru: 'Больше ничего не потеряется.' },
    price: 289, oldPrice: 329, condition: 'new', badge: null, rating: 4.8, reviews: 198,
    storage: S(['4-pack', 0]), colors: f('white'), stock: 33,
    specs: [{ ka: 'ქსელი', en: 'Network', v: 'Find My · Precision Finding' }],
  },
  {
    id: 'magic-keyboard', sku: 'MKBD', category: 'accessories', group: 'Mice & Keyboard', device: 'accessory',
    name: 'Magic Keyboard with Touch ID',
    tagline: { ka: 'აკრეფა და ავტორიზაცია.', en: 'Type and authenticate.', ru: 'Печатай и авторизуйся.' },
    price: 449, oldPrice: 519, condition: 'new', badge: null, rating: 4.7, reviews: 87,
    storage: S(['—', 0]), colors: f('white', 'spaceBlack'), stock: 12,
    specs: [{ ka: 'განლაგება', en: 'Layout', v: 'US · GE engraving available' }],
  },
  {
    id: 'car-mount', sku: 'CMNT', category: 'accessories', group: 'Car Gadgets', device: 'accessory',
    name: 'Magnetic Car Vent Mount',
    tagline: { ka: 'მყარი დაჭერა, ერთი ხელით.', en: 'Firm grip, one hand.', ru: 'Надёжно, одной рукой.' },
    price: 39, oldPrice: 55, condition: 'new', badge: 'sale', rating: 4.2, reviews: 156,
    storage: S(['—', 0]), colors: f('jetBlack'), stock: 64,
    specs: [{ ka: 'თავსებადობა', en: 'Fits', v: 'MagSafe · all iPhone' }],
  },
  {
    id: 'cleanmymac', sku: 'CMMX', category: 'accessories', group: 'Software', device: 'accessory',
    name: 'CleanMyMac X',
    tagline: { ka: 'Mac, სუფთა და სწრაფი.', en: 'Mac, clean and quick.', ru: 'Mac — чистый и быстрый.' },
    price: 99, oldPrice: 139, condition: 'new', badge: null, rating: 4.5, reviews: 74,
    storage: S(['1 year', 0], ['Lifetime', 180]), colors: f('white'), stock: 999,
    specs: [{ ka: 'ლიცენზია', en: 'Licence', v: '1 Mac' }],
  },

  /* ------------------------------------------------------------ Gift Cards */
  {
    id: 'gift-card', sku: 'GIFT', category: 'gifts', device: 'gift',
    name: 'iLand Gift Card',
    tagline: { ka: 'აჩუქე არჩევანი.', en: 'Give the choice.', ru: 'Подарите выбор.' },
    price: 100, oldPrice: null, condition: 'new', badge: null, rating: 5, reviews: 41,
    storage: S(['100₾', 0], ['250₾', 150], ['500₾', 400], ['1000₾', 900]),
    colors: f('jetBlack', 'silver'), stock: 999,
    specs: [{ ka: 'ვადა', en: 'Valid', v: '12 months' }, { ka: 'ფორმატი', en: 'Format', v: 'Digital or physical card' }],
  },
];

/* ------------------------------------------------------------------ Service */
export const SERVICES = [
  {
    id: 'screen-replacement', icon: 'screen',
    name: { ka: 'ეკრანის შეცვლა', en: 'Screen replacement', ru: 'Замена экрана' },
    desc: {
      ka: 'ორიგინალი ეკრანი, ერთი დღეში. True Tone და Face ID ინარჩუნებს მუშაობას.',
      en: 'Original display, same day. True Tone and Face ID keep working.',
      ru: 'Оригинальный дисплей за день. True Tone и Face ID сохраняются.',
    },
    from: 189, eta: { ka: '1 დღე', en: '1 day', ru: '1 день' }, warranty: 6,
  },
  {
    id: 'battery', icon: 'battery',
    name: { ka: 'ბატარეის შეცვლა', en: 'Battery replacement', ru: 'Замена аккумулятора' },
    desc: {
      ka: 'ახალი ბატარეა 100% ტევადობით და ჯანმრთელობის ჩვენებით.',
      en: 'A new cell at 100% capacity, with battery health reporting intact.',
      ru: 'Новый аккумулятор 100% ёмкости с корректным показом здоровья.',
    },
    from: 129, eta: { ka: '2 საათი', en: '2 hours', ru: '2 часа' }, warranty: 12,
  },
  {
    id: 'water-damage', icon: 'water',
    name: { ka: 'წყლის დაზიანება', en: 'Liquid damage', ru: 'Попадание жидкости' },
    desc: {
      ka: 'ულტრაბგერითი წმენდა და დაფის აღდგენა. დიაგნოსტიკა უფასოა.',
      en: 'Ultrasonic cleaning and board-level recovery. Diagnosis is free.',
      ru: 'Ультразвуковая чистка и ремонт платы. Диагностика бесплатно.',
    },
    from: 149, eta: { ka: '2–4 დღე', en: '2–4 days', ru: '2–4 дня' }, warranty: 3,
  },
  {
    id: 'data-transfer', icon: 'data',
    name: { ka: 'მონაცემების გადატანა', en: 'Data transfer', ru: 'Перенос данных' },
    desc: {
      ka: 'ძველიდან ახალ მოწყობილობაზე — უფასოდ, ყოველი ჩვენთან ნაყიდი მოწყობილობისთვის.',
      en: 'Old device to new — free with every device bought from us.',
      ru: 'Со старого устройства на новое — бесплатно при покупке у нас.',
    },
    from: 0, eta: { ka: '30 წუთი', en: '30 min', ru: '30 минут' }, warranty: 0,
  },
  {
    id: 'diagnostics', icon: 'diag',
    name: { ka: 'დიაგნოსტიკა', en: 'Diagnostics', ru: 'Диагностика' },
    desc: {
      ka: '32-პუნქტიანი შემოწმება წერილობითი დასკვნით. ყოველთვის უფასო.',
      en: 'A 32-point check with a written report. Always free.',
      ru: 'Проверка по 32 пунктам с письменным заключением. Всегда бесплатно.',
    },
    from: 0, eta: { ka: '20 წუთი', en: '20 min', ru: '20 минут' }, warranty: 0,
  },
  {
    id: 'trade-in', icon: 'tradein',
    name: { ka: 'Trade-in', en: 'Trade-in', ru: 'Trade-in' },
    desc: {
      ka: 'ჩააბარე ძველი მოწყობილობა და ფასდაკლება მიიღე ახალზე, იმავე დღეს.',
      en: 'Hand in the old device, take the discount on the new one, same day.',
      ru: 'Сдайте старое устройство и получите скидку на новое в тот же день.',
    },
    from: 0, eta: { ka: '15 წუთი', en: '15 min', ru: '15 минут' }, warranty: 0,
  },
];

/* ------------------------------------------------------------------ Banners */
export const BANNERS = [
  {
    id: 'b-17pro', active: true, order: 1,
    eyebrow: { ka: 'ახალი', en: 'New arrival', ru: 'Новинка' },
    title: { ka: 'iPhone 17 Pro', en: 'iPhone 17 Pro', ru: 'iPhone 17 Pro' },
    sub: {
      ka: 'ალუმინის უნიბოდი, A19 Pro და სამი 48MP კამერა. მარაგშია ვაკეში.',
      en: 'Aluminium unibody, A19 Pro and three 48MP cameras. In stock in Vake.',
      ru: 'Алюминиевый корпус, A19 Pro и три камеры 48 Мп. В наличии в Ваке.',
    },
    cta: { ka: 'ნახე iPhone 17 Pro', en: 'See iPhone 17 Pro', ru: 'Смотреть iPhone 17 Pro' },
    href: '#product/iphone-17-pro', product: 'iphone-17-pro',
    tone: 'orange',
  },
  {
    id: 'b-air', active: true, order: 2,
    eyebrow: { ka: '5.6 მმ', en: '5.6 mm', ru: '5,6 мм' },
    title: { ka: 'iPhone Air', en: 'iPhone Air', ru: 'iPhone Air' },
    sub: {
      ka: 'ყველაზე თხელი iPhone, რაც კი აშენებულა. 0%-იანი განვადებით.',
      en: 'The thinnest iPhone ever built. Available at 0% instalments.',
      ru: 'Самый тонкий iPhone. Доступна рассрочка 0%.',
    },
    cta: { ka: 'გაიცანი iPhone Air', en: 'Meet iPhone Air', ru: 'Знакомьтесь, iPhone Air' },
    href: '#product/iphone-air', product: 'iphone-air',
    tone: 'sky',
  },
  {
    id: 'b-service', active: true, order: 3,
    eyebrow: { ka: 'სერვისი', en: 'Service', ru: 'Сервис' },
    title: { ka: 'ეკრანი ერთ დღეში', en: 'Screen in a day', ru: 'Экран за один день' },
    sub: {
      ka: 'ორიგინალი ნაწილები, 6 თვის გარანტია, დიაგნოსტიკა უფასოდ.',
      en: 'Original parts, 6-month warranty, free diagnosis.',
      ru: 'Оригинальные детали, гарантия 6 месяцев, бесплатная диагностика.',
    },
    cta: { ka: 'სერვისზე გადასვლა', en: 'Go to Service', ru: 'Перейти в сервис' },
    href: '#service', product: null,
    tone: 'deep',
  },
];

/* ------------------------------------------------------------ Sales / promos */
export const PROMOS = [
  {
    id: 'p-autumn', active: true,
    label: { ka: 'შემოდგომის ფასდაკლება', en: 'Autumn sale', ru: 'Осенняя распродажа' },
    type: 'percent', value: 15,
    scope: 'category', target: 'mac',
    starts: '2026-07-01', ends: '2026-09-30',
    badge: { ka: '−15%', en: '−15%', ru: '−15%' },
  },
  {
    id: 'p-acc', active: true,
    label: { ka: 'აქსესუარები კომპლექტში', en: 'Accessory bundle', ru: 'Комплект аксессуаров' },
    type: 'percent', value: 20,
    scope: 'category', target: 'accessories',
    starts: '2026-07-15', ends: '2026-08-31',
    badge: { ka: '−20%', en: '−20%', ru: '−20%' },
  },
  {
    id: 'p-student', active: false,
    label: { ka: 'სტუდენტური', en: 'Student offer', ru: 'Студентам' },
    type: 'fixed', value: 200,
    scope: 'category', target: 'mac',
    starts: '2026-09-01', ends: '2026-10-15',
    badge: { ka: '−200₾', en: '−200₾', ru: '−200₾' },
  },
];

/* ------------------------------------------------- Instalment partners (GE) */
export const INSTALMENTS = [
  { id: 'tbc',    name: 'TBC',            months: [3, 6, 12, 24, 36], rate: 0,    label: '0%' },
  { id: 'bog',    name: 'Bank of Georgia',months: [3, 6, 12, 24],     rate: 0,    label: '0%' },
  { id: 'credo',  name: 'Credo',          months: [6, 12, 18],        rate: 0.02, label: '2%' },
];

export const SETTINGS = {
  currency: '₾',
  freeShippingOver: 200,
  deliveryTbilisiHours: 3,
  deliveryRegionsDays: 2,
  warrantyMonths: 12,
  returnDays: 14,
  testBanner: false,
};
