export function toBinaryString(v: number[], includeLength: boolean) {
  const length = v.length
  let n = length << 2
  if (includeLength) {
    const m = Number(v[length - 1])
    n -= 4
    if ((m < n - 3) || (m > n))
      return null

    n = m
  }

  const r: string[] = []
  for (let i = 0; i < length; i++) {
    r[i] = String.fromCharCode(
      v[i] & 0xFF,
      v[i] >>> 8 & 0xFF,
      v[i] >>> 16 & 0xFF,
      v[i] >>> 24 & 0xFF,
    )
  }
  const result = r.join('')
  if (includeLength)
    return result.substring(0, n)

  return result
}

export function toUint32Array(bs: string, includeLength: boolean) {
  const length = bs.length
  let n = length >> 2
  if ((length & 3) !== 0)
    ++n

  let v: number[]
  if (includeLength) {
    v = Array.from({ length: n + 1 })
    v[n] = length
  }
  else {
    v = Array.from({ length: n })
  }
  for (let i = 0; i < length; ++i)
    v[i >> 2] |= bs.charCodeAt(i) << ((i & 3) << 3)

  return v
}

const DELTA = 0x9E3779B9

export function encryptUint32Array(v: number[], k: number[]) {
  const length = v.length
  const n = length - 1
  let y: number, e: number, p: number, q: number
  let z = v[n]
  let sum = 0
  for (q = Math.floor(6 + 52 / length) | 0; q > 0; --q) {
    sum = int32(sum + DELTA)
    e = sum >>> 2 & 3
    for (p = 0; p < n; ++p) {
      y = v[p + 1]
      z = v[p] = int32(v[p] + mx(sum, y, z, p, e, k))
    }
    y = v[0]
    z = v[n] = int32(v[n] + mx(sum, y, z, n, e, k))
  }
  return v
}

export function decryptUint32Array(v: number[], k: number[]) {
  const length = v.length
  const n = length - 1
  let z: number, sum: number, e: number, p: number
  let y = v[0]
  const q = Math.floor(6 + 52 / length)
  for (sum = int32(q * DELTA); sum !== 0; sum = int32(sum - DELTA)) {
    e = sum >>> 2 & 3
    for (p = n; p > 0; --p) {
      z = v[p - 1]
      y = v[p] = int32(v[p] - mx(sum, y, z, p, e, k))
    }
    z = v[n]
    y = v[0] = int32(v[0] - mx(sum, y, z, 0, e, k))
  }
  return v
}

function int32(i: number) {
  return i & 0xFFFFFFFF
}

function mx(
  sum: number,
  y: number,
  z: number,
  p: number,
  e: number,
  k: number[],
) {
  return ((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[p & 3 ^ e] ^ z))
}

export function fixk(k: number[]) {
  if (k.length < 4)
    k.length = 4
  return k
}
