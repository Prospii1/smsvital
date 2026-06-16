const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

export const SERVICES = [
  { id: 'tg', name: 'Telegram',  c: '#2CA5E0', avail: 48213, base: 0.18, smspvaCode: 'opt29',  logoUrl: si('telegram')  },
  { id: 'wa', name: 'WhatsApp',  c: '#25D366', avail: 22904, base: 0.42, smspvaCode: 'opt20',  logoUrl: si('whatsapp')  },
  { id: 'go', name: 'Google',    c: '#4285F4', avail: 61022, base: 0.31, smspvaCode: 'opt1',   logoUrl: si('google')    },
  { id: 'ig', name: 'Instagram', c: '#E1306C', avail: 18337, base: 0.55, smspvaCode: 'opt16',  logoUrl: si('instagram') },
  { id: 'tt', name: 'TikTok',    c: '#010101', avail: 9921,  base: 0.49, smspvaCode: 'opt104', logoUrl: si('tiktok')    },
  { id: 'oa', name: 'OpenAI',    c: '#412991', avail: 4410,  base: 1.20, smspvaCode: 'opt132', logoUrl: si('openai')    },
  { id: 'di', name: 'Discord',   c: '#5865F2', avail: 31188, base: 0.27, smspvaCode: 'opt45',  logoUrl: si('discord')   },
  { id: 'fb', name: 'Facebook',  c: '#1877F2', avail: 40551, base: 0.24, smspvaCode: 'opt2',   logoUrl: si('facebook')  },
  { id: 'tn', name: 'Tinder',    c: '#FF6B6B', avail: 2233,  base: 0.92, smspvaCode: 'opt9',   logoUrl: si('tinder')    },
  { id: 'ub', name: 'Uber',      c: '#000000', avail: 7740,  base: 0.61, smspvaCode: 'opt72',  logoUrl: si('uber')      },
  { id: 'pp', name: 'PayPal',    c: '#003087', avail: 1502,  base: 1.05, smspvaCode: 'opt83',  logoUrl: si('paypal')    },
  { id: 'cb', name: 'Coinbase',  c: '#0052FF', avail: 988,   base: 1.40, smspvaCode: 'opt112', logoUrl: si('coinbase')  },
  { id: 'st', name: 'Steam',     c: '#1B2838', avail: 12044, base: 0.34, smspvaCode: 'opt58',  logoUrl: si('steam')     },
  { id: 'am', name: 'Amazon',    c: '#FF9900', avail: 15630, base: 0.38, smspvaCode: 'opt44',  logoUrl: si('amazon')    },
  { id: 'ne', name: 'Netflix',   c: '#E50914', avail: 5512,  base: 0.58, smspvaCode: 'opt101', logoUrl: si('netflix')   },
  { id: 'mi', name: 'Microsoft', c: '#0078D4', avail: 26110, base: 0.29, smspvaCode: 'opt15',  logoUrl: si('microsoft') },
];

// countries — iso code + dial + smspvaCode (SMSPVA activation API code) + availability multiplier
export const COUNTRIES = [
  { id: 'us', name: 'United States',  dial: '+1',   smspvaCode: 'US', mult: 1.6,  avail: 0.9  },
  { id: 'gb', name: 'United Kingdom', dial: '+44',  smspvaCode: 'UK', mult: 1.4,  avail: 0.7  },
  { id: 'ca', name: 'Canada',         dial: '+1',   smspvaCode: 'CA', mult: 1.5,  avail: 0.65 },
  { id: 'au', name: 'Australia',      dial: '+61',  smspvaCode: 'AU', mult: 1.5,  avail: 0.6  },
  { id: 'de', name: 'Germany',        dial: '+49',  smspvaCode: 'DE', mult: 1.3,  avail: 0.5  },
  { id: 'fr', name: 'France',         dial: '+33',  smspvaCode: 'FR', mult: 1.25, avail: 0.55 },
  { id: 'jp', name: 'Japan',          dial: '+81',  smspvaCode: 'JP', mult: 1.4,  avail: 0.5  },
  { id: 'sg', name: 'Singapore',      dial: '+65',  smspvaCode: 'SG', mult: 1.2,  avail: 0.6  },
  { id: 'br', name: 'Brazil',         dial: '+55',  smspvaCode: 'BR', mult: 0.9,  avail: 0.8  },
  { id: 'pl', name: 'Poland',         dial: '+48',  smspvaCode: 'PL', mult: 0.95, avail: 0.75 },
  { id: 'ua', name: 'Ukraine',        dial: '+380', smspvaCode: 'UA', mult: 0.7,  avail: 0.9  },
  { id: 'mx', name: 'Mexico',         dial: '+52',  smspvaCode: 'MX', mult: 0.85, avail: 0.7  },
  { id: 'tr', name: 'Turkey',         dial: '+90',  smspvaCode: 'TR', mult: 0.7,  avail: 0.85 },
  { id: 'th', name: 'Thailand',       dial: '+66',  smspvaCode: 'TH', mult: 0.75, avail: 0.8  },
  { id: 'my', name: 'Malaysia',       dial: '+60',  smspvaCode: 'MY', mult: 0.75, avail: 0.8  },
  { id: 'ph', name: 'Philippines',    dial: '+63',  smspvaCode: 'PH', mult: 0.8,  avail: 0.85 },
  { id: 'id', name: 'Indonesia',      dial: '+62',  smspvaCode: 'ID', mult: 0.6,  avail: 1.0  },
  { id: 'vn', name: 'Vietnam',        dial: '+84',  smspvaCode: 'VN', mult: 0.6,  avail: 0.95 },
];

// admin markup rule — fallback when catalog fetch is unavailable
export const MARKUP = { type: 'percent', value: 35, min: 0.05 };
// Default USD→NGN rate used for fallback price display
const DEFAULT_USD_NGN = 1600;

export function applyMarkup(raw: number, m: { percent: number; min_usd: number; usd_to_ngn?: number }): number {
  const fee = Math.max(raw * (m.percent / 100), m.min_usd);
  return Math.round((raw + fee) * (m.usd_to_ngn ?? DEFAULT_USD_NGN));
}

export function priceFor(service: any, country: any, usdToNgn = DEFAULT_USD_NGN) {
  const base = service.base * country.mult;
  const fee = Math.max(base * (MARKUP.value / 100), MARKUP.min);
  return Math.round((base + fee) * usdToNgn);
}
export function availFor(service: any, country: any) {
  return Math.max(0, Math.round(service.avail * country.avail));
}

// a fake assigned phone number for a country (demo / seed data only)
export function genNumber(country: any) {
  const n = () => Math.floor(Math.random() * 10);
  const body = Array.from({ length: 9 }, n).join('');
  return `${country.dial} ${body.slice(0,3)} ${body.slice(3,6)} ${body.slice(6)}`;
}
export function genOtp() {
  return String(Math.floor(100000 + Math.random() * 899999));
}

// ---- account state (sample) ----
export const WALLET_START = 14.80;

export const SEED_TRANSACTIONS = [
  { id: 'TXN-9F2A', t: 'topup',    label: 'Wallet top-up',              amt: +10.00, ref: 'MCRAPI · card', when: 'Today, 09:41' },
  { id: 'TXN-9E14', t: 'purchase', label: 'Telegram · Philippines',     amt: -0.28,  ref: 'ORD-7741',      when: 'Today, 09:38' },
  { id: 'TXN-9D07', t: 'purchase', label: 'OpenAI · United States',     amt: -1.62,  ref: 'ORD-7738',      when: 'Yesterday, 22:10' },
  { id: 'TXN-9C55', t: 'refund',   label: 'Refund · no SMS',            amt: +0.55,  ref: 'ORD-7732',      when: 'Yesterday, 20:02' },
  { id: 'TXN-9B30', t: 'topup',    label: 'Wallet top-up',              amt: +5.00,  ref: 'MCRAPI · card', when: 'May 28, 14:20' },
  { id: 'TXN-9A11', t: 'purchase', label: 'WhatsApp · Indonesia',       amt: -0.57,  ref: 'ORD-7720',      when: 'May 28, 14:18' },
];

export const SEED_ORDERS = [
  { id: 'ORD-7741', svc: 'tg', cc: 'ph', number: '+63 905 814 091', code: '518240', price: 0.28, status: 'received', age: '12m ago' },
  { id: 'ORD-7738', svc: 'oa', cc: 'us', number: '+1 415 882 7740',  code: '903117', price: 1.62, status: 'received', age: '11h ago' },
  { id: 'ORD-7732', svc: 'di', cc: 'gb', number: '+44 7700 900812',  code: null,     price: 0.36, status: 'expired',  age: '13h ago' },
  { id: 'ORD-7720', svc: 'wa', cc: 'id', number: '+62 811 220 553',  code: '447902', price: 0.57, status: 'received', age: '2d ago'  },
];

export const svcById = (id: string, customList?: any[]) => {
  const list = customList && customList.length > 0 ? customList : SERVICES;
  return list.find(s => s.id === id || s.smspvaCode === id);
};
export const ccById  = (id: string) => COUNTRIES.find(c => c.id === id || c.smspvaCode === id);

// Relative time computed live from a real timestamp — order.age used to be a
// string frozen at purchase time ("just now"), which never updated. This
// recomputes it on every render from created_at instead.
export function timeAgo(createdAt: string | number | Date | undefined): string {
  if (!createdAt) return "";
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
