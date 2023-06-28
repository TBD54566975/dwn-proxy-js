import DwnHttpServer from './dwn-http-server.js'
import type { DwnRequest, DwnResponse } from './dwn-types.js'
import { parseRequest } from './dwn-json-rpc.js'
import { Dwn, SignatureInput } from '@tbd54566975/dwn-sdk-js'
import { DidState } from '@tbd54566975/dids'

interface IInboundHandler {
  (dwnRequest: DwnRequest): Promise<void | DwnResponse>
}
interface IInbound {
  (dwnRequest: DwnRequest): IInboundHandler | void
}

type DidStateWithSignatureInput = DidState & {
  signatureInput: SignatureInput
}
export type DwnProxyOptions = Partial<{
  didState: DidStateWithSignatureInput
  serviceEndpoint: string
}>

export default class DwnProxy {
  options: DwnProxyOptions
  dwn: Dwn
  #server: DwnHttpServer
  #inbounds: Array<IInbound> = []

  constructor(options: DwnProxyOptions) {
    this.options = options
  }

  inbound = async (request: DwnRequest): Promise<DwnResponse | void> => {
    // [kw] could use a has map of sorts instead of iterating every time
    for (const match of this.#inbounds) {
      const middleware = match(request)
      if (middleware) {
        return await middleware(request)
      }
    }

    throw new Error('Unable to find middleware')
  }

  outbound = async () => {
    console.log('todo')
  }

  addHandler = (handler: IInbound) => this.#inbounds.push(handler)

  mapOutbound = (map, func) => {
    console.log('todo', map, func)
  }

  listen = async (port: number) => {
    this.dwn = await Dwn.create()

    this.#server = new DwnHttpServer({
      dwn      : this.dwn,
      parse    : parseRequest,
      handler  : this.inbound,
      fallback : this.outbound
    })

    this.#server.listen(port, () => {
      console.log(`server listening on port ${port}`)
    })
  }
}