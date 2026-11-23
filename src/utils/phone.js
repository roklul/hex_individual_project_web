// 台灣電話：手機 09 開頭共 10 碼；市話 02–08 區碼開頭共 9–10 碼，可在區碼後加 -
export function isValidTwPhone(input) {
  const s = String(input).trim();
  if (/^09\d{8}$/.test(s)) return true;
  if (!/^0[2-8]\d{0,2}-?\d{6,8}$/.test(s)) return false;
  const digits = s.replace('-', '');
  return digits.length >= 9 && digits.length <= 10;
}
