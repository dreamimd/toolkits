import {
  appendFile,
  mkdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import axios from 'axios'

export interface FetcherOptions {
  /** 下载输出目录 */
  dir?: string

  /** 节奏大师服务器地址 */
  api?: string

  /** 是否清空输出目录 */
  clean: boolean

  /** 下载指定谱面，空串代表下载全部谱面 */
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

  constructor(options?: FetcherOptions) {
    this._options = {
      ...ImdFetcher.defaultFetcherOptions(),
      ...options,
    }
  }

  async init() {
    await this.initWorkspace()
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

  async initWorkspace() {
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

  async log<T extends Exclude<keyof Console, 'Console'>>(
    type: T,
    ...args: Parameters<Console[T]>
  ) {
    if (!this._logFilePath)
      throw new Error('Log failed! Workspace have not been initiated properly!')

    // eslint-disable-next-line no-console, prefer-spread
    console[type].apply(console, args as any[])

    const logTxt = `${args.join(' ')}\n`
    await appendFile(this._logFilePath, logTxt, 'utf-8')
  }

  /** 发送请求的对象 */
  private _request = axios.create({})

  async initRequest() {
    this._request.defaults.baseURL = this._options.api
  }

  /**
   * 下载某个文件
   * @param url 下载 url
   * @param path 文件本地存储地址
   */
  async download(url: string, path: string) {
    this.log('log', '正在下载：', url)
    const saveDir = resolve(path, '..')
    const res = await axios.get(url, { responseType: 'stream' })
    await mkdir(saveDir, { recursive: true })
    await writeFile(path, res.data, 'binary')
    this.log('log', '下载完成：', url)
  }

  async getConfigs()
}
