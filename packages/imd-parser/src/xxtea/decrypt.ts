import {
  decryptUint32Array,
  fixk,
  toBinaryString,
  toUint32Array,
} from './_utils'
import { utf8Encode } from './utf8Encode'
import { utf8Decode } from './utf8Decode'
import { xxatob } from './atob'

export function decrypt(data: string, key: string) {
  if (data === undefined || data === null || data.length === 0)
    return data

  key = utf8Encode(key)
  const binaryString = toBinaryString(
    decryptUint32Array(
      toUint32Array(data, false),
      fixk(toUint32Array(key, false)),
    ),
    true,
  )

  if (!binaryString)
    throw new Error('Decrypt Error!')

  return utf8Decode(binaryString)
}

export function decryptFromBase64(data: string, key: string) {
  if (data === undefined || data === null || data.length === 0)
    return data

  return decrypt(xxatob(data), key)
}
