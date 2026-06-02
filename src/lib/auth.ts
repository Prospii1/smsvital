export interface AuthUser { id: string; email: string; joinedAt: string; }
type Result<T> = { data: T; error?: never } | { data?: never; error: string };

async function hashPw(email: string, pw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase() + ':' + pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function store(key: string, val: unknown) {
  localStorage.setItem('smsv_' + key, JSON.stringify(val));
}
function load<T>(key: string, def: T): T {
  try { const r = localStorage.getItem('smsv_' + key); return r ? JSON.parse(r) : def; } catch { return def; }
}
function remove(key: string) { localStorage.removeItem('smsv_' + key); }

export async function signup(email: string, password: string): Promise<Result<AuthUser>> {
  const accounts = load<Record<string, any>>('accounts', {});
  const key = email.toLowerCase();
  if (accounts[key]) return { error: 'Email already registered. Sign in instead.' };
  const pw = await hashPw(email, password);
  const user: AuthUser = { id: crypto.randomUUID(), email: key, joinedAt: new Date().toISOString() };
  accounts[key] = { ...user, pw };
  store('accounts', accounts);
  store('session', user);
  return { data: user };
}

export async function login(email: string, password: string): Promise<Result<AuthUser>> {
  const accounts = load<Record<string, any>>('accounts', {});
  const key = email.toLowerCase();
  const acc = accounts[key];
  if (!acc) return { error: 'No account found with that email.' };
  const pw = await hashPw(email, password);
  if (acc.pw !== pw) return { error: 'Wrong password. Please try again.' };
  const user: AuthUser = { id: acc.id, email: acc.email, joinedAt: acc.joinedAt };
  store('session', user);
  return { data: user };
}

export function logout() { remove('session'); }

export function getUser(): AuthUser | null { return load<AuthUser | null>('session', null); }

export function getUserData<T>(userId: string, key: string, def: T): T {
  return load<T>(`u_${userId}_${key}`, def);
}
export function setUserData<T>(userId: string, key: string, val: T) {
  store(`u_${userId}_${key}`, val);
}
