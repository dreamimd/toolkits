export interface FetcherOptions {
  /** 下载输出目录 */
  dir?: string

  /** 节奏大师服务器地址 */
  api?: string
}

export class ImdFetcher {
  static defaultFetcherOptions(): Required<FetcherOptions> {
    return {
      dir: './rm',
      api: 'https://res.ds.qq.com',
    }
  }

  private _options: Required<FetcherOptions>

  constructor(options?: FetcherOptions) {
    this._options = {
      ...ImdFetcher.defaultFetcherOptions(),
      ...options,
    }
  }

  private _initWorkspace() {

  }
}
