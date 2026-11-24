// 與後端 ORDER_STATUS_TRANSITIONS 一致：狀態只能往前推進，取消只能在出貨前
export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  待付款: ['處理中', '已取消'],
  處理中: ['已出貨', '已取消'],
  已出貨: ['已完成'],
  已完成: [],
  已取消: [],
})

/** 下拉選單可選的狀態：目前狀態 + 可以前往的狀態 */
export const statusOptions = (current) => [current, ...(ORDER_STATUS_TRANSITIONS[current] || [])]
