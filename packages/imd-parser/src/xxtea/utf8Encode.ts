export function utf8Encode(str: string) {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(str))
    return str

  const buf = []
  const n = str.length
  for (let i = 0, j = 0; i < n; ++i, ++j) {
    const codeUnit = str.charCodeAt(i)
    if (codeUnit < 0x80) {
      buf[j] = str.charAt(i)
    }
    else if (codeUnit < 0x800) {
      buf[j] = String.fromCharCode(0xC0 | (codeUnit >> 6), 0x80 | (codeUnit & 0x3F))
    }
    else if (codeUnit < 0xD800 || codeUnit > 0xDFFF) {
      buf[j] = String.fromCharCode(0xE0 | (codeUnit >> 12), 0x80 | ((codeUnit >> 6) & 0x3F), 0x80 | (codeUnit & 0x3F))
    }
    else {
      if (i + 1 < n) {
        const nextCodeUnit = str.charCodeAt(i + 1)
        if (codeUnit < 0xDC00 && nextCodeUnit >= 0xDC00 && nextCodeUnit <= 0xDFFF) {
          const rune = (((codeUnit & 0x03FF) << 10) | (nextCodeUnit & 0x03FF)) + 0x010000
          buf[j] = String.fromCharCode(0xF0 | ((rune >> 18) & 0x3F), 0x80 | ((rune >> 12) & 0x3F), 0x80 | ((rune >> 6) & 0x3F), 0x80 | (rune & 0x3F))
          ++i
          continue
        }
      }
      throw new Error('Malformed string')
    }
  }
  return buf.join('')
}
