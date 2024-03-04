const BASE64_ENCODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('')

export function xxbtoa(str: string) {
  let len = str.length
  const r = len % 3
  len = len - r

  let l = (len / 3) << 2
  if (r > 0)
    l += 4

  const buf = Array.from({ length: l })

  let i = 0
  let j = 0
  let c: number
  while (i < len) {
    c = str.charCodeAt(i++) << 16 |
    str.charCodeAt(i++) << 8 |
    str.charCodeAt(i++)
    buf[j++] = BASE64_ENCODE_CHARS[c >> 18] +
    BASE64_ENCODE_CHARS[c >> 12 & 0x3F] +
    BASE64_ENCODE_CHARS[c >> 6 & 0x3F] +
    BASE64_ENCODE_CHARS[c & 0x3F]
  }
  if (r === 1) {
    c = str.charCodeAt(i++)
    buf[j++] = `${BASE64_ENCODE_CHARS[c >> 2] +
    BASE64_ENCODE_CHARS[(c & 0x03) << 4]
          }==`
  }
  else if (r === 2) {
    c = str.charCodeAt(i++) << 8 |
    str.charCodeAt(i++)
    buf[j++] = `${BASE64_ENCODE_CHARS[c >> 10] +
    BASE64_ENCODE_CHARS[c >> 4 & 0x3F] +
    BASE64_ENCODE_CHARS[(c & 0x0F) << 2]
          }=`
  }
  return buf.join('')
}
