import DwnHttpServer from './dwn-http-server.js'
import type { DwnRequest, DwnResponse } from './dwn-http-server.js'
import { parseRequest } from './dwn-json-rpc.js'

export default class DwnProxy {
  #dwn: any
  #server: DwnHttpServer

  constructor() {
    this.#server = new DwnHttpServer({
      parse    : parseRequest,
      handler  : this.#inbound,
      fallback : this.#outbound
    })
  }

  #inbound = async (request: DwnRequest): Promise<DwnResponse> => {
    console.log('todo', request)
    return {
      reply: {
        todo: ''
      }
    }
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