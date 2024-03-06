/** 加密盐值前缀 */
import { deflate, inflate } from 'pako'
import { decryptFromBase64, encryptToBase64 } from '../xxtea'

/**
 * 解密 .rmp 文件的原始字符串，生成 json 字符串
 * @param raw .rmp 原始字符串
 * @param mapName 谱面名称，用于生成加密盐值，例如：please_4k_hd
 * @returns json 字符串
 */
export function decryptRmp(raw: string, mapName: string) {
  const salt = getSalt(mapName)
  return decryptCommon(raw, salt)
}

/**
 * 将 json 字符串加密回 .rmp 文件原始字符串
 * @param data json 字符串
 * @param mapName 谱面名称，用于生成加密盐值，例如：please_4k_hd
 * @returns .rmp 文件原始字符串
 */
export function encryptRmp(data: string, mapName: string) {
  const charCodeArray = new Uint8Array(data.length)
  for (let i = 0; i < data.length; ++i)
    charCodeArray[i] = data.charCodeAt(i)

  const defalted = deflate(charCodeArray, { memLevel: 9 })
  const dataToEncrypt = arrayBufferToBase64(defalted)
  const salt = getSalt(mapName)
  return encryptToBase64(dataToEncrypt, salt)
}

/**
 * 节奏大师标准 base64 解密流程，获得 json 字符串
 * @param raw 原始字符串
 * @param key 解密盐值
 * @returns json 字符串
 */
export function decryptCommon(raw: string, key: string) {
  const decryptData = decryptFromBase64(raw, key)
  const arrayBuffer = base64ToArrayBuffer(decryptData)
  const inflated = inflate(arrayBuffer)

  let result = ''
  let p: number
  for (p = 0; p < inflated.length / 8192; p++)
    result += String.fromCharCode(...inflated.slice(8192 * p, 8192 * (p + 1)))

  result += String.fromCharCode(...inflated.slice(8192 * p))
  return result
}

const SRECRET_SALT = 'RMP4TT3RN'

/**
 * 目前节奏大师官方的加密盐值生成规则：SECRET + 谱面路径
 *
 * 例如：
 *
 * SECRET = RMP4TT3RN
 *
 * 谱面路径 = please_4k_hd
 *
 * 加密盐值 = RMP4TT3RNplease_4k_hd
 * @param filePath 谱面名称
 */
export function getSalt(mapName: string) {
  return `${SRECRET_SALT}${mapName}`
}

function base64ToArrayBuffer(e: string) {
  const t = atob(e)
  const n = t.length
  const o = new Uint8Array(n)
  for (let i = 0; i < n; i++)
    o[i] = t.charCodeAt(i)
  return o
}

function arrayBufferToBase64(buffer: Uint8Array) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++)
    binary += String.fromCharCode(bytes[i])

  return btoa(binary)
}
