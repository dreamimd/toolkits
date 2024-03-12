import type {
  ImdBasic,
  RmpMap,
  RmpNote,
} from './types'
import { basicToFilename, resolveFilename } from './utils/filename'
import { cloneDeep } from './utils/clone-deep'
import {
  decryptRmp,
  encryptRmp,
  getSalt,
} from './utils/secret'
import {
  isLineEnd,
  isLineProcess,
  isLineStart,
  isSingleAction,
} from './utils/imd-note-type'

/** 轨道编号起始值 */
const TRACK_START = 3

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
      return IMD._initRmp(basic)

    if (typeof data === 'object')
      return IMD._fromRmpMap(basic, data)

    // if (basic.ext === 'imd')
    //   return IMD._fromImdRaw(basic, data)

    if (basic.ext === 'rmp')
      return IMD._fromRmpRaw(basic, data)

    return IMD._fromRmpJson(basic, data)
  }

  /** 从 .rmp 文件原始加密字符串生成谱面实例 */
  private static _fromRmpRaw(basic: ImdBasic, raw: string) {
    const filename = basicToFilename(basic)
    const rmpJson = decryptRmp(raw, filename)
    return IMD._fromRmpJson(basic, rmpJson)
  }

  /**
   * 从 .imd 文件原始二进制文件字符串生成谱面实例
   *
   * 这里为了兼容浏览器端，不使用 Node.js 的 Buffer
   */
  // private static _fromImdRaw(basic: ImdBasic, raw: string) {

  // }

  private static _fromRmpJson(basic: ImdBasic, json: string) {
    const map = JSON.parse(json) as RmpMap
    return IMD._fromRmpMap(basic, map)
  }

  private static _fromRmpMap(basic: ImdBasic, map: RmpMap) {
    return new IMD(basic, map)
  }

  private static _initRmp(basic: ImdBasic) {
    const map: RmpMap = {
      signature: 'BNDQ',
      version: '',
      tempo: 100,
      duration: 0,
      durationtime: 0,
      tracks: [],
    }
    for (let i = 0; i < basic.keyNum; i++) {
      map.tracks.push({
        track: TRACK_START + i,
        note: [],
      })
    }
    return IMD._fromRmpMap(basic, map)
  }

  /** 当前正在处理中的谱面数据对象 */
  private map: RmpMap

  /**
   * 谱面动作索引。
   *
   * 初始化时，需要对 rmp 格式的谱面对象做预处理，生成动作索引。
   *
   * @key 每一个动作
   * @value 该动作对应的完整持续动作
   */
  private _actionMap = new Map<RmpNote, RmpNote[]>()

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

  /** 加密盐值 */
  get salt() {
    return getSalt(this.filename)
  }

  constructor(options: ImdBasic, map: RmpMap) {
    this.name = options.name
    this.difficulty = options.difficulty
    this.map = map
    this.resolveMap()
  }

  /** 预处理谱面 */
  private resolveMap() {
    // 给每个按键标记上所在轨道
    this.map.tracks.forEach((track) => {
      track.note.forEach((note) => {
        note._track = track.track
        note._isResolved = false
      })
    })

    // 拍平为按键列表，按照时间顺序排列
    const notes = this.getFlatedNotes()

    notes.forEach((note, index) => {
      if (note._isResolved)
        return

      const lines = [note]
      note._isResolved = true
      this._actionMap.set(note, lines)
      if (isSingleAction(note))
        return

      // 向后寻找完整的持续动作
      let nextTrack = note.toTrack
      let nextTick = note.tick + note.dur
      for (let i = index + 1; i < notes.length; i++) {
        const curNote = notes[i]

        // 时间超限，寻找结束
        if (curNote.tick > nextTick)
          break

        // 单键，跳过
        if (isSingleAction(curNote))
          continue

        // 非目标轨道动作，跳过
        if (curNote._track !== nextTrack)
          continue

        // 非法折线：持续动作尚未碰到 isEnd 就又遇到了持续动作的开头。兼容方式：跳过
        if (isLineStart(curNote))
          continue

        // 非法折线：当前动作是长按，但是目标轨道的下一个动作时间不匹配。兼容方式：跳过
        if (curNote.tick !== nextTick)
          continue

        // 合法折线，记录数据
        curNote._isResolved = true
        lines.push(curNote)
        this._actionMap.set(curNote, lines)
        nextTrack = curNote.toTrack
        nextTick = curNote.tick + curNote.dur
      }
    })
  }

  /**
   * 获取拍平后的按键列表，并按照时间顺序排列
   * @param markIdx 是否在处理的过程中，按照排列顺序重新标记 idx
   * @returns 拍平处理后的按键列表
   */
  getFlatedNotes(markIdx?: boolean) {
    const result = this.map.tracks
      .map(item => item.note)
      .flat()
      .sort((a, b) => {
        const tickDelta = a.tick - b.tick
        if (tickDelta === 0)
          return Number(a._track) - Number(b._track)

        return tickDelta
      })

    if (markIdx) {
      result.forEach((item, index) => {
        item.idx = index
      })
    }

    return result
  }

  /** 对当前谱面进行排序 */
  sortMap() {
    this.getFlatedNotes(true)

    // 对谱面进行排序
    this.map.tracks.forEach((track) => {
      track.note.sort((a, b) => {
        const tickDelta = a.tick - b.tick
        if (tickDelta === 0)
          return Number(a._track) - Number(b._track)

        return tickDelta
      })
    })
  }

  /** 获取谱面 map 对象，返回 map 对象前会进行排序处理 */
  getMap() {
    this.sortMap()
    return this.map
  }

  /** 输出一份标准的谱面 map 对象 */
  toMap() {
    const mapClone = cloneDeep<RmpMap>(this.getMap())

    // 去掉额外的数据
    mapClone.tracks.forEach((track) => {
      track.note.forEach((note) => {
        delete note._track
        delete note._isResolved
      })
    })
    return mapClone
  }

  toRmpJson() {
    return JSON.stringify(this.toMap())
  }

  toRmpRaw() {
    return encryptRmp(this.toRmpJson(), this.filename)
  }

  toImdRaw() {

  }
}
