import type { ImdBasic } from '../types'

/**
 * 解析谱面名称，从中获取基本信息
 * @param filename
 * @returns 谱面基本信息
 */
export function resolveFilename(filename: string) {
  let current = filename

  const sep = filename.includes('\\') ? '\\' : '/'
  const sepArr = current.trim().split(sep)
  current = sepArr[sepArr.length - 1]

  const [head, ...exts] = current.split('.')
  const ext = exts.join('.')
  current = head

  const [
    name = '',
    keyNumStr = '4k',
    difficulty = 'hd',
  ] = current.trim().split('_')

  const result: ImdBasic & {
    /** 谱面格式后缀 */
    ext: string
  } = {
    name,
    keyNum: Number(keyNumStr[0]),
    difficulty,
    ext,
  }

  return result
}

/**
 * 根据谱面基本信息生成谱面文件名
 * @param options 基本信息
 * @param ext 文件名后缀
 * @returns 文件名
 */
export function basicToFilename(options: ImdBasic, ext?: string) {
  const { name, keyNum, difficulty } = options
  let result = `${name}_${keyNum}k_${difficulty}`
  if (ext)
    result += `.${ext}`
  return result
}

/**
 * 根据谱面基本信息生成谱面路径，谱面路径的用途之一就是生成加密盐值
 *
 * 路径实例：please/please_4k_hd
 * @param options 基本信息
 * @returns 谱面路径
 */
export function basicToFilePath(options: ImdBasic) {
  const { name, keyNum, difficulty } = options
  return `${name}/${name}_${keyNum}k_${difficulty}`
}
