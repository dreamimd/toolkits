export interface RMPData {
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
  tracks: RMPTrack[]
}

export interface RMPTrack {
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
  note: RMPNote[]
}

export interface RMPNote {
  idx: number
  tick: number
  key: number
  dur: number
  isEnd: number
  toTrack: number
  volume: number
  pan: number
  attr: number
  time: number
  time_dur: number
}
