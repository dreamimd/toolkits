import type { ImdBasic, RmpMap } from './types'
import {
  basicToFilePath,
  basicToFilename,
  decryptRmp,
  encryptRmp,
  getSalt,
  resolveFilename,
} from './utils'

export class IMD implements ImdBasic {
  /**
   * 生成谱面实例
   *
   * @param filename 谱面名称，不会去读取文件，主要用于解析出谱面的基本信息
   * 谱面名称支持形式：包含 ${name}_${keyNum}k_${difficulty}.${ext} 的字符串即可
   *
   * 例如：
   * - `please_4k_hd.json` 标准格式
   * - `C:\RM\please\please_4k_hd.rmp` 可以是完整的文件路径，只要能从文件名中读取到名称、键数、难度信息即可
   * - `/root/data/RM/please/please_4k_hd` 不带文件后缀也是支持的
   *
   * 关于谱面格式后缀 ext，格式后缀将决定 IMD 解析器遇到纯字符串时将按照何种规则解析：
   * - rmp：解密 rmp 加密字符串为 json
   * - imd：读取 imd 二进制内容，构造出 json 对象
   * - json：直接将字符串转为 json 对象
   * - 其他：按照 json 的规则处理
   *
   * @param data 谱面数据
   * - 若为空，则生成空谱面数据
   * - 若为 json 对象，则直接进行构造
   * - 若为字符串，则根据谱面名称解析出的后缀，按照特定的方式先转为 json 对象
   *
   * @returns 谱面实例
   */
  static from(filename: string, data?: string | RmpMap) {
    const basic = resolveFilename(filename)
    if (!data)
      return IMD.initRmp(basic)

    if (typeof data === 'object')
      return IMD.fromRmpMap(basic, data)

    if (basic.ext === 'imd')
      return IMD.fromImdRaw(basic, data)

    if (basic.ext === 'rmp')
      return IMD.fromRmpRaw(basic, data)

    return IMD.fromRmpJson(basic, data)
  }

  /** 从 .rmp 文件原始加密字符串生成谱面实例 */
  private static fromRmpRaw(basic: ImdBasic, raw: string) {
    const filePath = basicToFilePath(basic)
    const rmpJson = decryptRmp(raw, filePath)
    return IMD.fromRmpJson(basic, rmpJson)
  }

  /**
   * 从 .imd 文件原始二进制文件字符串生成谱面实例
   *
   * 这里为了兼容浏览器端，不使用 Node.js 的 Buffer
   */
  private static fromImdRaw(basic: ImdBasic, raw: string) {

  }

  private static fromRmpJson(basic: ImdBasic, json: string) {
    const map = JSON.parse(json) as RmpMap
    return IMD.fromRmpMap(basic, map)
  }

  private static fromRmpMap(basic: ImdBasic, map: RmpMap) {
    return new IMD(basic, map)
  }

  private static initRmp(basic: ImdBasic) {
    const map: RmpMap = {
      signature: 'BNDQ',
      version: '',
      tempo: 100,
      duration: 0,
      durationtime: 0,
      tracks: [],
    }
    const trackStart = 3
    for (let i = 0; i < basic.keyNum; i++) {
      map.tracks.push({
        track: trackStart + i,
        note: [],
      })
    }
    return IMD.fromRmpMap(basic, map)
  }

  /** 谱面数据对象 */
  map: RmpMap

  /** 谱面名称 */
  name: string

  /** 谱面难度标识 */
  difficulty: string

  /** 轨道数 */
  get keyNum() {
    return this.map.tracks.length
  }

  /** 文件名 */
  get filename() {
    return basicToFilename(this)
  }

  /** 谱面的路径字符串 */
  get path() {
    return basicToFilePath(this)
  }

  /** 加密盐值 */
  get salt() {
    return getSalt(this.path)
  }

  constructor(options: ImdBasic, map: RmpMap) {
    this.name = options.name
    this.difficulty = options.difficulty
    this.map = map
  }

  toRmpJson() {
    return JSON.stringify(this.map)
  }

  toRmpRaw() {
    return encryptRmp(this.toRmpJson(), this.path)
  }

  toImdRaw() {

  }
}
