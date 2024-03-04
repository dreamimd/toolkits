import { deflate, inflate } from 'pako'
import { decryptFromBase64, encryptToBase64 } from '../xxtea'
import type { RMP } from './types'

/**
 * 解密 .rmp 文件的原始字符串，生成 json 字符串
 * @param raw .rmp 原始字符串
 * @param key 谱面加密的 key，例如：please/please_4k_hd
 * @returns json 字符串
 */
export function decryptToRmpJson(raw: string, key: string) {
  const salt = generateSalt(key)
  const decryptData = decryptFromBase64(raw, salt)
  const arrayBuffer = base64ToArrayBuffer(decryptData)
  const inflated = inflate(arrayBuffer)

  let result = ''
  let p: number
  for (p = 0; p < inflated.length / 8192; p++)
    result += String.fromCharCode(...inflated.slice(8192 * p, 8192 * (p + 1)))

  result += String.fromCharCode(...inflated.slice(8192 * p))
  return result
}

/** 解密 .rmp 文件的原始字符串，生成 RMP 对象 */
export function decryptToRmp(raw: string, key: string) {
  return JSON.parse(decryptToRmpJson(raw, key)) as RMP
}

/**
 * 将 json 字符串加密回 .rmp 文件原始字符串
 * @param data json 字符串
 * @param key 谱面加密的 key，例如：please/please_4k_hd
 * @returns .rmp 文件原始字符串
 */
export function encryptFromRmpJson(data: string, key: string) {
  const charCodeArray = new Uint8Array(data.length)
  for (let i = 0; i < data.length; ++i)
    charCodeArray[i] = data.charCodeAt(i)

  const defalted = deflate(charCodeArray, { memLevel: 9 })
  const dataToEncrypt = arrayBufferToBase64(defalted)
  const salt = generateSalt(key)
  return encryptToBase64(dataToEncrypt, salt)
}

/** 解密 .rmp 文件的原始字符串，生成 RMP 对象 */
export function encryptFromRmp(rmp: RMP, key: string) {
  return encryptFromRmpJson(JSON.stringify(rmp), key)
}

const SRECRET_SALT = 'RMP4TT3RN'

/**
 * 目前节奏大师官方的加密盐值生成规则：SECRET + 谱面路径
 *
 * 例如：
 *
 * SECRET = RMP4TT3RN
 *
 * 谱面路径 = please/please_4k_hd
 *
 * 加密盐值 = RMP4TT3RNplease/please_4k_hd
 */
function generateSalt(key: string) {
  return `${SRECRET_SALT}${key}`
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
