import { access } from 'node:fs/promises'

/** 判断文件或目录是否存在 */
export function isExist(path: string) {
  return access(path).then(() => true).catch(() => false)
}
