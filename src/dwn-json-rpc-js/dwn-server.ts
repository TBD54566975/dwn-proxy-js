import type { Readable as IsomorphicReadable } from 'readable-stream'
import { DwnServer as DwnServerReference } from './dwn-server-copy-pasta/dwn-server.js'

interface IProcess {
  (target: string, message: any, dataStream?: IsomorphicReadable): Promise<void>
}
type Options = Partial<{
  preProcess: IProcess
  postProcess: IProcess
}>
export type DwnServerOptions = Options

export class DwnServer extends DwnServerReference {
  static #options: Options

  constructor() {
    super()
  }

  static create(options?: Options): DwnServer {
    this.#options = options ?? {}

    return new DwnServer()
  }

  static async preProcess(target, message, dataStream) {
    if (this.#options.preProcess) this.#options.preProcess(target, message, dataStream)
  }

  static async postProcess(target, message, dataStream) {
    if (this.#options.postProcess) this.#options.postProcess(target, message, dataStream)
  }
}