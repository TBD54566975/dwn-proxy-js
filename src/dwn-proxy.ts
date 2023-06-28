import { DwnHttpServer } from './dwn-http-server.js'
import type { DwnRequest, DwnResponse } from './dwn-types.js'
import { Dwn, SignatureInput } from '@tbd54566975/dwn-sdk-js'

interface IInboundHandler {
  (dwnRequest: DwnRequest): Promise<void | DwnResponse>
}
interface IInbound {
  (dwnRequest: DwnRequest): IInboundHandler | void
}

type DidStateWithSignatureInput = {
  id: string
  signatureInput: SignatureInput
}
export type DwnProxyOptions = Partial<{
  serviceEndpoint: string
  didState: DidStateWithSignatureInput
}>

export class DwnProxy {
  #server: DwnHttpServer

  options: DwnProxyOptions
  dwn: Dwn
  inboundHandlers: Array<IInbound> = []

  constructor(options: DwnProxyOptions) {
    this.options = options
  }

  #inbound = async (request: DwnRequest): Promise<DwnResponse | void> => {
    // console.log('New inbound', request)
    // [kw] could use a has map of sorts instead of iterating every time
    for (const handler of this.inboundHandlers) {
      const func = handler(request)
      if (func) {
        return await func(request)
      }
    }

    throw new Error('Unable to find middleware')
  }

  #outbound = async () => {
    console.log('todo')
  }

  mapOutbound = (map, func) => {
    console.log('todo', map, func)
  }

  listen = async (port: number) => {
    this.dwn = await Dwn.create()

    this.#server = new DwnHttpServer({
      dwn      : this.dwn,
      handler  : this.#inbound,
      fallback : this.#outbound
    })

    this.#server.listen(port, () => {
      console.log(`server listening on port ${port}`)
    })
  }
}