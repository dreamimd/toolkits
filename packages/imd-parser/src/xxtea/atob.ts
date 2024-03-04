/* eslint-disable antfu/consistent-list-newline */

const BASE64_DECODE_CHARS = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
  -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
  -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1,
]

export function xxatob(str: string) {
  const len = str.length
  if (len % 4 !== 0)
    return ''

  if (/[^ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\+\/\=]/.test(str))
    return ''

  let r: number
  if (str.charAt(len - 2) === '=')
    r = 1

  else if (str.charAt(len - 1) === '=')
    r = 2

  else
    r = 0

  let l = len
  if (r > 0)
    l -= 4

  l = (l >> 2) * 3 + r
  const out = Array.from({ length: l })

  let i = 0
  let j = 0
  let c1: number, c2: number, c3: number, c4: number
  while (i < len) {
    // c1
    c1 = BASE64_DECODE_CHARS[str.charCodeAt(i++)]
    if (c1 === -1)
      break

    // c2
    c2 = BASE64_DECODE_CHARS[str.charCodeAt(i++)]
    if (c2 === -1)
      break

    out[j++] = String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4))

    // c3
    c3 = BASE64_DECODE_CHARS[str.charCodeAt(i++)]
    if (c3 === -1)
      break

    out[j++] = String.fromCharCode(((c2 & 0x0F) << 4) | ((c3 & 0x3C) >> 2))

    // c4
    c4 = BASE64_DECODE_CHARS[str.charCodeAt(i++)]
    if (c4 === -1)
      break

    out[j++] = String.fromCharCode(((c3 & 0x03) << 6) | c4)
  }

  return out.join('')
}
