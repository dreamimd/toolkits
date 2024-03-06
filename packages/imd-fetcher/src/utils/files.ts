import { access } from 'node:fs/promises'

/** 判断文件或目录是否存在 */
export function isExist(path: string) {
  return access(path).then(() => true).catch(() => false)
}

export function mp3FilePath(path: string) {
  return `${path}/${path}.mp3`
}

export function thumbFilePath(path: string) {
  return `${path}/${path}_thumb.jpg`
}

/**
 * 获取谱面路径
 *
 * 注意：不带文件后缀名！！！
 */
export function mapFilePath(path: string, keyNum: number, difficulty: string) {
  return `${path}/${path}_${keyNum}k_${difficulty}`
}
