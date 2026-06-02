/* data.jsx — realistic sample inventory & records (exported to window) */

// service monogram color (single hue family, varied) — no copyrighted logos
const SERVICES = [
  { id: 'tg', name: 'Telegram',  c: '#3aa0e0', avail: 48213, base: 0.18 },
  { id: 'wa', name: 'WhatsApp',  c: '#34e0a1', avail: 22904, base: 0.42 },
  { id: 'go', name: 'Google',    c: '#e0863a', avail: 61022, base: 0.31 },
  { id: 'ig', name: 'Instagram', c: '#d8569b', avail: 18337, base: 0.55 },
  { id: 'tt', name: 'TikTok',    c: '#6f6cf0', avail: 9921,  base: 0.49 },
  { id: 'oa', name: 'OpenAI',    c: '#34e0a1', avail: 4410,  base: 1.20 },
  { id: 'di', name: 'Discord',   c: '#7d83f0', avail: 31188, base: 0.27 },
  { id: 'fb', name: 'Facebook',  c: '#3a7fe0', avail: 40551, base: 0.24 },
  { id: 'tn', name: 'Tinder',    c: '#f0566f', avail: 2233,  base: 0.92 },
  { id: 'ub', name: 'Uber',      c: '#c9d1dc', avail: 7740,  base: 0.61 },
  { id: 'pp', name: 'PayPal',    c: '#3a6fe0', avail: 1502,  base: 1.05 },
  { id: 'cb', name: 'Coinbase',  c: '#3a8fe0', avail: 988,   base: 1.40 },
  { id: 'st', name: 'Steam',     c: '#7aa0c9', avail: 12044, base: 0.34 },
  { id: 'am', name: 'Amazon',    c: '#e0a13a', avail: 15630, base: 0.38 },
  { id: 'ne', name: 'Netflix',   c: '#f0566f', avail: 5512,  base: 0.58 },
  { id: 'mi', name: 'Microsoft', c: '#3a9fe0', avail: 26110, base: 0.29 },
];

// countries — iso code + dial + availability multiplier
const COUNTRIES = [
  { id: 'us', name: 'United States', dial: '+1',   mult: 1.6, avail: 0.9 },
  { id: 'gb', name: 'United Kingdom',dial: '+44',  mult: 1.4, avail: 0.7 },
  { id: 'in', name: 'India',         dial: '+91',  mult: 0.7, avail: 1.0 },
  { id: 'id', name: 'Indonesia',     dial: '+62',  mult: 0.6, avail: 1.0 },
  { id: 'ph', name: 'Philippines',   dial: '+63',  mult: 0.8, avail: 0.85 },
  { id: 'ng', name: 'Nigeria',       dial: '+234', mult: 0.7, avail: 0.6 },
  { id: 'ru', name: 'Russia',        dial: '+7',   mult: 0.65,avail: 1.0 },
  { id: 'ua', name: 'Ukraine',       dial: '+380', mult: 0.7, avail: 0.9 },
  { id: 'br', name: 'Brazil',        dial: '+55',  mult: 0.9, avail: 0.8 },
  { id: 'de', name: 'Germany',       dial: '+49',  mult: 1.3, avail: 0.5 },
  { id: 'fr', name: 'France',        dial: '+33',  mult: 1.25,avail: 0.55 },
  { id: 'pl', name: 'Poland',        dial: '+48',  mult: 0.95,avail: 0.75 },
  { id: 'vn', name: 'Vietnam',       dial: '+84',  mult: 0.6, avail: 0.95 },
  { id: 'th', name: 'Thailand',      dial: '+66',  mult: 0.75,avail: 0.8 },
  { id: 'mx', name: 'Mexico',        dial: '+52',  mult: 0.85,avail: 0.7 },
  { id: 'tr', name: 'Turkey',        dial: '+90',  mult: 0.7, avail: 0.85 },
];

// admin markup rule applied silently to user-facing price
const MARKUP = { type: 'percent', value: 35, min: 0.05 }; // +35%, min $0.05 fee

function priceFor(service, country) {
  const base = service.base * country.mult;
  const fee = Math.max(base * (MARKUP.value / 100), MARKUP.min);
  return Math.round((base + fee) * 100) / 100;
}
function availFor(service, country) {
  return Math.max(0, Math.round(service.avail * country.avail));
}

// a fake assigned phone number for a country
function genNumber(country) {
  const n = () => Math.floor(Math.random() * 10);
  const body = Array.from({ length: 9 }, n).join('');
  return `${country.dial} ${body.slice(0,3)} ${body.slice(3,6)} ${body.slice(6)}`;
}
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 899999));
}

// ---- account state (sample) ----
const WALLET_START = 14.80;

const SEED_TRANSACTIONS = [
  { id: 'TXN-9F2A', t: 'topup',    label: 'Wallet top-up',         amt: +10.00, ref: 'MCRAPI · card', when: 'Today, 09:41' },
  { id: 'TXN-9E14', t: 'purchase', label: 'Telegram · India',      amt: -0.28,  ref: 'ORD-7741',      when: 'Today, 09:38' },
  { id: 'TXN-9D07', t: 'purchase', label: 'OpenAI · United States',amt: -1.62,  ref: 'ORD-7738',      when: 'Yesterday, 22:10' },
  { id: 'TXN-9C55', t: 'refund',   label: 'Refund · no SMS',       amt: +0.55,  ref: 'ORD-7732',      when: 'Yesterday, 20:02' },
  { id: 'TXN-9B30', t: 'topup',    label: 'Wallet top-up',         amt: +5.00,  ref: 'MCRAPI · card', when: 'May 28, 14:20' },
  { id: 'TXN-9A11', t: 'purchase', label: 'WhatsApp · Indonesia',  amt: -0.57,  ref: 'ORD-7720',      when: 'May 28, 14:18' },
];

const SEED_ORDERS = [
  { id: 'ORD-7741', svc: 'tg', cc: 'in', number: '+91 814 552 091', code: '518240', price: 0.28, status: 'received', age: '12m ago' },
  { id: 'ORD-7738', svc: 'oa', cc: 'us', number: '+1 415 882 7740', code: '903117', price: 1.62, status: 'received', age: '11h ago' },
  { id: 'ORD-7732', svc: 'di', cc: 'gb', number: '+44 7700 900812', code: null,     price: 0.36, status: 'expired',  age: '13h ago' },
  { id: 'ORD-7720', svc: 'wa', cc: 'id', number: '+62 811 220 553', code: '447902', price: 0.57, status: 'received', age: '2d ago' },
];

// ---- admin sample ----
const ADMIN_STATS = {
  revenueToday: 1284.40,
  ordersToday: 3162,
  activeNumbers: 418,
  marginPct: 34.8,
  successRate: 92.4,
  revenue7d: [840, 910, 1020, 880, 1170, 1240, 1284],
  orders24h: [120,98,76,54,40,38,52,88,140,180,210,240,260,255,248,260,272,290,310,280,250,210,170,150],
};
const ADMIN_PROVIDERS = [
  { id: '5sim',  name: 'Provider A', status: 'healthy',  latency: 142, share: 41, fail: 0.4 },
  { id: 'smsa',  name: 'Provider B', status: 'healthy',  latency: 210, share: 28, fail: 0.9 },
  { id: 'daisy', name: 'Provider C', status: 'degraded', latency: 640, share: 17, fail: 4.2 },
  { id: 'pool',  name: 'Provider D', status: 'healthy',  latency: 188, share: 11, fail: 1.1 },
  { id: 'grz',   name: 'Provider E', status: 'down',     latency: null,share: 3,  fail: 100 },
];
const ADMIN_USERS = [
  { id: 'u_8841', email: 'leo.m****@proton.me', bal: 42.10, orders: 318, risk: 'low',  joined: 'Mar 2026', status: 'active' },
  { id: 'u_8830', email: 'k.devs****@gmail.com', bal: 4.80, orders: 91,  risk: 'low',  joined: 'Apr 2026', status: 'active' },
  { id: 'u_8822', email: 'reseller****@biz.io',  bal: 612.0,orders: 9043,risk: 'med',  joined: 'Jan 2026', status: 'active' },
  { id: 'u_8810', email: 'temp9912****@mail.ru',  bal: 0.00, orders: 12,  risk: 'high', joined: 'May 2026', status: 'flagged' },
  { id: 'u_8801', email: 'spammer****@10min.me',  bal: 0.05, orders: 4,   risk: 'high', joined: 'May 2026', status: 'banned' },
  { id: 'u_8795', email: 'a.singh****@gmail.com',  bal: 18.5, orders: 204, risk: 'low',  joined: 'Feb 2026', status: 'active' },
];
const ADMIN_FRAUD = [
  { id: 'f1', type: 'IP velocity',     detail: '38 orders / 5 min · 1 IP', sev: 'high',  when: '2m ago' },
  { id: 'f2', type: 'Disposable email',detail: 'temp9912****@mail.ru',     sev: 'med',   when: '14m ago' },
  { id: 'f3', type: 'Failed payments', detail: '6 declines · u_8810',      sev: 'med',   when: '31m ago' },
  { id: 'f4', type: 'Geo mismatch',    detail: 'VPN exit · purchase US #', sev: 'low',   when: '1h ago' },
];

const svcById = (id) => SERVICES.find(s => s.id === id);
const ccById  = (id) => COUNTRIES.find(c => c.id === id);

Object.assign(window, {
  SERVICES, COUNTRIES, MARKUP, priceFor, availFor, genNumber, genOtp,
  WALLET_START, SEED_TRANSACTIONS, SEED_ORDERS,
  ADMIN_STATS, ADMIN_PROVIDERS, ADMIN_USERS, ADMIN_FRAUD, svcById, ccById,
});
