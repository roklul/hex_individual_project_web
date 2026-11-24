// 台灣電話（前後端共用同一份規則）
// - 手機：09 開頭共 10 碼，可寫成 0912345678、0912-345-678、0912 345 678
// - 市話：02–08 區碼開頭共 9–10 碼，可寫成 0212345678、02-12345678、02-1234-5678、(02)1234-5678
export function isValidTwPhone(input) {
  const s = String(input).trim().replace(/\s+/g, '').replace(/^\((0\d{1,3})\)/, '$1-');
  if (/^09\d{2}-?\d{3}-?\d{3}$/.test(s)) return true;
  if (s.startsWith('09')) return false;
  const m = s.match(/^(0[2-8]\d{0,2})-?(\d{1,4})-?(\d{4})$/);
  if (!m) return false;
  const digits = m.slice(1).join('');
  return digits.length >= 9 && digits.length <= 10;
}
