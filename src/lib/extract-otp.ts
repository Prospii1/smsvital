export function extractOtp(raw: unknown): string {
  let s: string;
  if (typeof raw === "string") {
    s = raw;
  } else if (raw !== null && typeof raw === "object") {
    const o = raw as any;
    const inner = o.text ?? o.code ?? o.message ?? o.sms ?? o.body ?? o.otp;
    s = typeof inner === "string" ? inner : JSON.stringify(raw) ?? "";
  } else {
    s = String(raw ?? "");
  }
  // No \b — matches digits even when adjacent to letters (e.g. "hadah157578Jang")
  const m = s.match(/\d{4,8}/);
  return m ? m[0] : s;
}
