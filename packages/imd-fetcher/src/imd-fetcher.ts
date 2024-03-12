import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { Agent } from 'node:https'
import { zip } from 'compressing'
import axios from 'axios'
import { IMD, decryptCommon } from '@dreamimd/imd-parser'
import { isExist } from './utils'
import type { SongData, VersionData } from './types'

export interface FetcherOptions {
  /** 下载输出目录 */
  dir?: string

  /** 节奏大师服务器地址 */
  api?: string

  /** 是否清空输出目录 */
  clean: boolean

  /**
   * 下载指定谱面，空串代表下载全部谱面
   *
   * 需要填写歌曲的 path 值，而不是全名。
   * - 正例：beiduofenbingdu
   * - 反例：贝多芬病毒
   */
  target: string
}

export class ImdFetcher {
  static defaultFetcherOptions(): Required<FetcherOptions> {
    return {
      dir: './rm',
      api: 'https://res.ds.qq.com',
      clean: false,
      target: '',
    }
  }

  private _options: Required<FetcherOptions>

  private _version: VersionData | null = null

  private _configs: SongData[] = []

  constructor(options?: FetcherOptions) {
    this._options = {
      ...ImdFetcher.defaultFetcherOptions(),
      ...options,
    }
  }

  async action() {
    await this.init()

    if (this._options.target)
      await this.downloadSong(this._options.target)
    else
      await this.downloadAll()
  }

  async init() {
    await this.initWorkspace()
    await this.initRequest()
    await this.initConfigs()
  }

  get workspace() {
    return resolve(cwd(), this._options.dir)
  }

  get logDir() {
    return resolve(this.workspace, 'logs')
  }

  get songsDir() {
    return resolve(this.workspace, 'songs')
  }

  private async initWorkspace() {
    if (this._options.clean) {
      await rm(
        this.workspace,
        { recursive: true, force: true },
      )
    }

    const options = { recursive: true }
    await mkdir(this.workspace, options)

    // 初始化歌曲下载目录
    await mkdir(this.songsDir, options)

    // 初始化日志目录与文件
    await mkdir(this.logDir, options)

    this._logFilePath = resolve(this.logDir, `log-${new Date().getTime()}.txt`)
    await writeFile(this._logFilePath, '', 'utf-8')
  }

  /** 日志文件地址 */
  private _logFilePath = ''

  log<T extends Exclude<keyof Console, 'Console'>>(
    type: T,
    ...args: Parameters<Console[T]>
  ) {
    if (!this._logFilePath)
      throw new Error('Log failed! Workspace have not been initiated properly!')

    // eslint-disable-next-line no-console, prefer-spread
    console[type].apply(console, args as any[])

    const logTxt = `${args.join(' ')}\n`
    appendFileSync(this._logFilePath, logTxt, 'utf-8')
  }

  /** 发送请求的对象 */
  private _request = axios.create({})

  private async initRequest() {
    this._request.defaults.baseURL = this._options.api
    this._request.defaults.httpsAgent = new Agent({
      rejectUnauthorized: false,
    })
  }

  /**
   * 下载某个文件
   * @param url 下载 url
   * @param localPath 文件本地存储地址
   */
  private async download(url: string, localPath: string) {
    this.log('log', '正在下载：', url)

    const isLocalExist = await isExist(localPath)
    if (isLocalExist) {
      this.log('log', `${localPath} 已存在！`)
      return
    }

    const saveDir = resolve(localPath, '..')
    const res = await this._request.get(url, { responseType: 'stream' })
    await mkdir(saveDir, { recursive: true })
    await writeFile(localPath, res.data, 'binary')
    this.log('log', '下载完成：', url)
  }

  private async initConfigs() {
    await this.getVersion()

    this.log('log', '正在获取配置文件...')

    const decryptConfigPath = resolve(this.workspace, 'mrock_song_client.decrypt.json')
    const isDecryptConfigExist = await isExist(decryptConfigPath)
    if (!isDecryptConfigExist) {
      const zipPath = resolve(this.workspace, 'TableEnc.zip')
      await this.download(
        `/Table/Release/${this._version?.version}/TableEnc.zip`,
        zipPath,
      )

      await zip.uncompress(zipPath, this.workspace)

      const configPath = resolve(this.workspace, 'mrock_song_client.json')
      const buffer = await readFile(configPath, 'binary')
      const res = decryptCommon(buffer, this._version?.hash || '')
      // res = unescape(res.replace(/\\u/g, '%u'))
      await writeFile(decryptConfigPath, res, 'utf-8')
    }

    const json = await readFile(decryptConfigPath, 'utf-8')
    this._configs = JSON.parse(json) as SongData[]
  }

  private async getVersion() {
    this.log('log', '正在获取 verson 信息...')

    const versionPath = resolve(this.workspace, 'version.json')
    await this.download(
      '/Table/Release/version.json',
      versionPath,
    )

    const json = await readFile(versionPath, 'utf-8')
    this._version = JSON.parse(json) as VersionData
  }

  private async resolveRmpDownload(
    fullname: string,
    path: string,
    keyNum: number,
    difficulty: string,
    level: number = 0,
  ) {
    if (level <= 0)
      return

    const mapName = `${path}_${keyNum}k_${difficulty}`
    const url = `/SongRes/song/${path}/${mapName}.rmp`
    const localPath = resolve(this.songsDir, fullname, `${mapName}.rmp`)
    await this.download(url, localPath)

    const jsonLocalPath = resolve(this.songsDir, fullname, `${mapName}.json`)
    const isJsonExist = await isExist(jsonLocalPath)
    if (!isJsonExist) {
      this.log('log', `正在生成 json 谱面：${jsonLocalPath}`)
      const rmpRaw = await readFile(localPath, 'utf-8')
      const imd = IMD.from(localPath, rmpRaw)
      await writeFile(jsonLocalPath, imd.toRmpJson())
    }
    else {
      this.log('log', `json 谱面已存在：${jsonLocalPath}`)
    }
  }

  private async resolveMp3Download(fullname: string, path: string) {
    const url = `/SongRes/song/${path}/${path}.mp3`
    const localPath = resolve(this.songsDir, fullname, `${path}.mp3`)
    await this.download(url, localPath)
  }

  private async resolveThumbDownload(fullname: string, path: string) {
    const thumbName = `${path}_thumb.jpg`
    const url = `/SongRes/song/${path}/${thumbName}`
    const localPath = resolve(this.songsDir, fullname, thumbName)
    await this.download(url, localPath)
  }

  private async resolveSongDownload(config: SongData) {
    const {
      m_szSongName,
      m_szPath,
      m_ush4KeyEasy,
      m_ush4KeyNormal,
      m_ush4KeyHard,
      m_ush5KeyEasy,
      m_ush5KeyNormal,
      m_ush5KeyHard,
      m_ush6KeyEasy,
      m_ush6KeyNormal,
      m_ush6KeyHard,
    } = config

    const level = Number(m_ush6KeyHard) ||
      Number(m_ush5KeyHard) ||
      Number(m_ush4KeyHard) ||
      Number(m_ush6KeyNormal) ||
      Number(m_ush5KeyNormal) ||
      Number(m_ush4KeyNormal) ||
      Number(m_ush6KeyEasy) ||
      Number(m_ush5KeyEasy) ||
      Number(m_ush4KeyEasy)

    const fullname = `LV${level}.${m_szSongName}`.replace(/[?*"\/:|,\\<>]/g, '')

    this.log('log', '----------------------------------------------------------------')
    this.log('log', `正在处理谱面：${fullname}`)

    const errHandler = (sign: string, err: unknown) => {
      this.log('log', `${fullname}: ${sign} 处理失败！`)
      this.log('error', err)
    }

    const promises = [
      this.resolveMp3Download(fullname, m_szPath).catch(errHandler.bind(null, 'mp3')),
      this.resolveThumbDownload(fullname, m_szPath).catch(errHandler.bind(null, 'thumb')),
      this.resolveRmpDownload(fullname, m_szPath, 4, 'ez', Number(m_ush4KeyEasy)).catch(errHandler.bind(null, '4k_ez')),
      this.resolveRmpDownload(fullname, m_szPath, 4, 'nm', Number(m_ush4KeyNormal)).catch(errHandler.bind(null, '4k_nm')),
      this.resolveRmpDownload(fullname, m_szPath, 4, 'hd', Number(m_ush4KeyHard)).catch(errHandler.bind(null, '4k_hd')),
      this.resolveRmpDownload(fullname, m_szPath, 5, 'ez', Number(m_ush5KeyEasy)).catch(errHandler.bind(null, '5k_ez')),
      this.resolveRmpDownload(fullname, m_szPath, 5, 'nm', Number(m_ush5KeyNormal)).catch(errHandler.bind(null, '5k_nm')),
      this.resolveRmpDownload(fullname, m_szPath, 5, 'hd', Number(m_ush5KeyHard)).catch(errHandler.bind(null, '5k_hd')),
      this.resolveRmpDownload(fullname, m_szPath, 6, 'ez', Number(m_ush6KeyEasy)).catch(errHandler.bind(null, '6k_ez')),
      this.resolveRmpDownload(fullname, m_szPath, 6, 'nm', Number(m_ush6KeyNormal)).catch(errHandler.bind(null, '6k_nm')),
      this.resolveRmpDownload(fullname, m_szPath, 6, 'hd', Number(m_ush6KeyHard)).catch(errHandler.bind(null, '6k_hd')),
    ]

    await Promise.allSettled(promises)
  }

  async downloadAll() {
    if (!this._version)
      throw new Error('Can not download before init!')

    for (let i = 0; i < this._configs.length; i++)
      await this.resolveSongDownload(this._configs[i])
  }

  async downloadSong(path: string) {
    if (!this._version)
      throw new Error('Can not download before init!')

    const song = this._configs.find(item => item.m_szPath === path)
    if (song)
      await this.resolveSongDownload(song)
  }
}
