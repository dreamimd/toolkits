export interface RmpMap {
  /**
   * 意义暂时不明
   * @default 'BNDQ'
   */
  signature: string

  /** RMP 协议版本，semver 格式。例：1.3.0 */
  version: string

  /** 对应歌曲的 BPM，每分钟有多少拍 */
  tempo: number

  /**
   * 对应歌曲持续时间，单位：tick
   *
   * tick 是 RMP 定义的时间单位，谱面中标注时间点使用 tick 而不是 ms
   *
   * 1 tick 对应的 ms 数 = 60000ms / tempo / 48
   */
  duration: number

  /** 对应歌曲持续时间，单位：ms */
  durationtime: number

  /** 轨道信息 */
  tracks: RmpTrack[]
}

export interface RmpTrack {
  /**
   * 轨道编号，从 3 开始，0-2 保留。
   *
   * 例如 4k 的轨道编号分别为：3 4 5 6
   *
   * 5K 的轨道编号分别为：3 4 5 6 7
   *
   * 以此类推
   */
  track: number

  /** 该轨道上的按键 */
  note: RmpNote[]
}

export interface RmpNote {
  /** 所有 Note 按时间顺序排列后的索引 */
  idx: number

  /** 按键打击时间点，单位：tick */
  tick: number

  /** 按键打击时间点，单位：ms */
  time: number

  /**
   * - 当前动作为长按时，为持续时间，单位：tick
   * - 当前动作为点、滑时，为 0
   */
  dur: number

  /**
   * - 当前动作为长按时，为持续时间，单位：ms
   * - 当前动作为点时，为 0
   * - 当前动作为滑时，为轨道偏移值。左滑 x 轨: -x；右滑 x 轨：x
   */
  time_dur: number

  /** 当前动作是否为持续动作的结束 */
  isEnd: number

  /**
   * - 当前动作为长按时，为当前轨道编号。
   * - 当前动作为滑时，为动作滑向的轨道编号。
   * - 当前动作为点时，为 0
   */
  toTrack: number

  /**
   * - 0: 单点
   * - 3: 持续动作动作 开始
   * - 4: 持续动作 进行中 / 结束
   */
  attr: number

  /** 暂时没发现作用，永远为 0 */
  key: number

  /** 暂时没发现作用，永远为 0 */
  volume: number

  /** 暂时没发现作用，永远为 0 */
  pan: number

  // 以下带下划线的属性为计算处理谱面时临时添加，输出时要删去

  /** 当前动作所在的轨道编号 */
  _track?: number

  /** 该动作是否完成预解析 */
  _isResolved?: boolean
}

/** Imd 基本信息，从文件名中解析出 */
export interface ImdBasic {
  /** 谱面名称 */
  name: string

  /** 谱面难度 */
  difficulty: string

  /** 谱面轨道数 */
  keyNum: number
}
