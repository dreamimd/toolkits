/**
 * @param bs
 * @param n n is UTF16 length
 */
export function utf8Decode(bs: string, n?: number) {
  if (n === undefined || n === null || (n < 0))
    n = bs.length

  if (n === 0)
    return ''

  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(bs) || !(/^[\x00-\xFF]*$/.test(bs))) {
    if (n === bs.length)
      return bs
    return bs.substr(0, n)
  }

  return ((n < 0x7FFF) ?
    utf8DecodeShortString(bs, n) :
    utf8DecodeLongString(bs, n))
}

function utf8DecodeShortString(bs: string, n: number) {
  const charCodes = Array.from<number>({ length: n })
  let i = 0
  let off = 0
  for (let len = bs.length; i < n && off < len; i++) {
    const unit = bs.charCodeAt(off++)
    switch (unit >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        charCodes[i] = unit
        break
      case 12:
      case 13:
        if (off < len) {
          charCodes[i] = ((unit & 0x1F) << 6) |
          (bs.charCodeAt(off++) & 0x3F)
        }
        else {
          throw new Error('Unfinished UTF-8 octet sequence')
        }
        break
      case 14:
        if (off + 1 < len) {
          charCodes[i] = ((unit & 0x0F) << 12) |
          ((bs.charCodeAt(off++) & 0x3F) << 6) |
          (bs.charCodeAt(off++) & 0x3F)
        }
        else {
          throw new Error('Unfinished UTF-8 octet sequence')
        }
        break
      case 15:
        if (off + 2 < len) {
          const rune = (((unit & 0x07) << 18) |
            ((bs.charCodeAt(off++) & 0x3F) << 12) |
            ((bs.charCodeAt(off++) & 0x3F) << 6) |
            (bs.charCodeAt(off++) & 0x3F)) - 0x10000
          if (rune >= 0 && rune <= 0xFFFFF) {
            charCodes[i++] = (((rune >> 10) & 0x03FF) | 0xD800)
            charCodes[i] = ((rune & 0x03FF) | 0xDC00)
          }
          else {
            throw new Error(`Character outside valid Unicode range: 0x${rune.toString(16)}`)
          }
        }
        else {
          throw new Error('Unfinished UTF-8 octet sequence')
        }
        break
      default:
        throw new Error(`Bad UTF-8 encoding 0x${unit.toString(16)}`)
    }
  }
  if (i < n)
    charCodes.length = i

  return String.fromCharCode(...charCodes)
}

function utf8DecodeLongString(bs: string, n: number) {
  const buf = []
  const charCodes = Array.from<number>({ length: 0x8000 })
  let i = 0
  let off = 0
  for (let len = bs.length; i < n && off < len; i++) {
    const unit = bs.charCodeAt(off++)
    switch (unit >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        charCodes[i] = unit
        break
      case 12:
      case 13:
        if (off < len) {
          charCodes[i] = ((unit & 0x1F) << 6) |
          (bs.charCodeAt(off++) & 0x3F)
        }
        else {
          throw new Error('Unfinished UTF-8 octet sequence')
        }
        break
      case 14:
        if (off + 1 < len) {
          charCodes[i] = ((unit & 0x0F) << 12) |
          ((bs.charCodeAt(off++) & 0x3F) << 6) |
          (bs.charCodeAt(off++) & 0x3F)
        }
        else {
          throw new Error('Unfinished UTF-8 octet sequence')
        }
        break
      case 15:
        if (off + 2 < len) {
          const rune = (((unit & 0x07) << 18) |
            ((bs.charCodeAt(off++) & 0x3F) << 12) |
            ((bs.charCodeAt(off++) & 0x3F) << 6) |
            (bs.charCodeAt(off++) & 0x3F)) - 0x10000
          if (rune >= 0 && rune <= 0xFFFFF) {
            charCodes[i++] = (((rune >> 10) & 0x03FF) | 0xD800)
            charCodes[i] = ((rune & 0x03FF) | 0xDC00)
          }
          else {
            throw new Error(`Character outside valid Unicode range: 0x${rune.toString(16)}`)
          }
        }
        else {
          throw new Error('Unfinished UTF-8 octet sequence')
        }
        break
      default:
        throw new Error(`Bad UTF-8 encoding 0x${unit.toString(16)}`)
    }
    if (i >= 0x7FFF - 1) {
      const size = i + 1
      charCodes.length = size
      buf[buf.length] = String.fromCharCode(...charCodes)
      n -= size
      i = -1
    }
  }
  if (i > 0) {
    charCodes.length = i
    buf[buf.length] = String.fromCharCode(...charCodes)
  }
  return buf.join('')
}
