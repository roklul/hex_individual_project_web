import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isValidTwPhone } from '../src/utils/phone.js'

test('台灣電話：接受常見寫法', () => {
  for (const p of ['0912345678', '0912-345-678', '0912 345 678', ' 0912345678 ', '0212345678', '02-12345678', '02-1234-5678', '(02)1234-5678', '(02) 12345678', '037-123456', '049-2345678', '0826-12345']) {
    assert.equal(isValidTwPhone(p), true, p)
  }
})

test('台灣電話：拒絕錯誤號碼', () => {
  for (const p of ['', '12345', '09212345678', '091234567', '0912-34-5678x', '0112345678', '02-123', '(02)', '02--12345678', '0912345678901', 'abc', '+886912345678']) {
    assert.equal(isValidTwPhone(p), false, p)
  }
})
