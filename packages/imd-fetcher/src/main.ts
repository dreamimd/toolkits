import process from 'node:process'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import type { FetcherOptions } from './imd-fetcher'
import { ImdFetcher } from './imd-fetcher'

interface Options extends Required<FetcherOptions> {
  /** 是否清空输出目录 */
  clean: boolean

  /** 下载指定谱面，空串代表下载全部谱面 */
  target: string
}

const defaultOptions = ImdFetcher.defaultFetcherOptions()

yargs(hideBin(process.argv))
  .command<Options>('*', '下载节奏大师谱面', (y) => {
    y
      .option('dir', {
        desc: '下载输出目录',
        type: 'string',
        default: defaultOptions.dir,
      })
      .option('api', {
        desc: '节奏大师服务器地址',
        type: 'string',
        default: defaultOptions.api,
      })
      .option('clean', {
        desc: '是否清空输出目录',
        type: 'boolean',
        default: false,
      })
      .option('target', {
        desc: '下载指定谱面，空串代表下载全部谱面',
        type: 'string',
        default: '',
      })
  }, async (args) => {
    // const imdFetcher = new ImdFetcher(args)
  })
  .parse()
