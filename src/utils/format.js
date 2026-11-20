const nf = new Intl.NumberFormat('zh-TW')
export const currency = (n) => `NT$ ${nf.format(n ?? 0)}`
