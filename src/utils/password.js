// 與後端 passwordSchema 相同的規則
export function passwordError(password) {
  if (password.length < 8) return '密碼至少 8 碼'
  if (password.length > 72) return '密碼最多 72 碼'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return '密碼需同時包含英文與數字'
  return ''
}
