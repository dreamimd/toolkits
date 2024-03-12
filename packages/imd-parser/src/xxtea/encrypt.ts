import {
  encryptUint32Array,
  fixk,
  toBinaryString,
  toUint32Array,
} from './_utils'
import { utf8Encode } from './utf8-encode'
import { btoa } from './btoa'

export function encrypt(data: string, key: string) {
  if (data === undefined || data === null || data.length === 0)
    return data

  data = utf8Encode(data)
  key = utf8Encode(key)

  const binaryString = toBinaryString(
    encryptUint32Array(
      toUint32Array(data, true),
      fixk(toUint32Array(key, false)),
    ),
    false,
  )

  if (!binaryString)
    throw new Error('Encrypt Error!')

  return binaryString
}

export function encryptToBase64(data: string, key: string) {
  return btoa(encrypt(data, key))
}
