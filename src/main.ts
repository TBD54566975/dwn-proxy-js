
type DwnMessage = {
  things: string
}

type DwnHttpServerOptions = {
  parser: (req: any) => DwnMessage
  handler: () => Promise<void>
  fallback: (req, res) => Promise<void>
}
class DwnHttpServer {
  #options: DwnHttpServerOptions

  constructor(options: DwnHttpServerOptions) {
    this.#options = options
  }
}

type DwnJsonRpcMessage = {
  params: DwnMessage
}
class DwnJsonRpc {
  static parse = (message: any): DwnMessage => {
    return {
      things: message
    }
  }

  static create = (message: DwnMessage): DwnJsonRpcMessage => {
    return {
      params: message
    }
  }
}

export default class DwnProxy {
  #dwn: any
  #server: DwnHttpServer

  constructor() {
    this.#server = new DwnHttpServer({
      parser   : DwnJsonRpc.parse,
      handler  : this.#inbound,
      fallback : this.#outbound
    })
  }

  #inbound = async () => {
    console.log('todo')
  }

  #outbound = async () => {
    console.log('todo')
  }

  mapInbound = (map, func) => {
    console.log('todo', map, func)
  }

  mapOutbound = (map, func) => {
    console.log('todo', map, func)
  }

  listen = async () => {
    console.log('todo')
  }
}

class TbdPfiDwnProxy extends DwnProxy {
  /** configure protocol */
  /** map requests to functions */

  constructor() {
    super()

    super.mapInbound(() => undefined, this.offering)
    super.mapInbound(() => undefined, this.rfq)
    super.mapOutbound(() => undefined, this.quote)
    super.mapOutbound(() => undefined, this.orderStatus)
  }

  offering = async () => {
    console.log('todo')
    /**
     * - fetch from backend
     * - write record (publish: true)
     * - return record
     */
  }

  rfq = async () => {
    console.log('todo')
    /**
     * - fetch to backend
     * - reply 202
     */
  }

  quote = async () => {
    console.log('todo')
    /**
     * - write rfq record
     * - write quote record
     * - send quote
     */
  }

  orderStatus = async () => {
    console.log('todo')
    /**
     * - write orderstatus record
     * - send orderstatus
     */
  }
}

const proxy = new TbdPfiDwnProxy()
await proxy.listen()