import {
  encryptUint32Array,
  fixk,
  toBinaryString,
  toUint32Array,
} from './_utils'
import { utf8Encode } from './utf8Encode'
import { xxbtoa } from './btoa'

export function encrypt(data: string, key: string) {
  if (data === undefined || data === null || data.length === 0)
    return data

  data = utf8Encode(data)
  key = utf8Encode(key)

  // 注意，解码失败会返回空串
  return toBinaryString(
    encryptUint32Array(
      toUint32Array(data, true),
      fixk(toUint32Array(key, false)),
    ),
    false,
  ) || ''
}

export function encryptToBase64(data: string, key: string) {
  return xxbtoa(encrypt(data, key))
}
