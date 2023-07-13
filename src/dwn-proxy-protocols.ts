import { ProtocolsConfigure, RecordsQuery, RecordsWrite } from '@tbd54566975/dwn-sdk-js'
import { DwnProxy } from './dwn-proxy.js'
import type { DwnRequest } from './dwn-types.js'
import type { Request, Response } from 'express'
import { Readable } from 'node:stream'
import type { Readable as IsomorphicReadable } from 'readable-stream'
import { readReq } from './dwn-http-server.js'

export class MarkupDotReference {
  static resolveDotDelimited = (obj: any, value: string) => {
    const propChain = value.split('.').slice(1)
    let protoValue = obj
    for (let prop of propChain) {
      protoValue = protoValue[prop]
      if (protoValue === undefined) {
        return false
      }
    }
    return protoValue
  }

  static referenceReplace = (obj: any, replacements: any): any => {
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        obj[key] = value.map(item => MarkupDotReference.referenceReplace(item, replacements))
      } else if (typeof value === 'object') {
        obj[key] = MarkupDotReference.referenceReplace(value, replacements)
      } else if (typeof value === 'string' && value[0] === '#') {
        const dotDelimited = value.split('.')
        if (dotDelimited.length === 1) {
          if (replacements[value])
            obj[key] = replacements[value]
        } else {
          if (replacements[dotDelimited[0]])
            obj[key] = MarkupDotReference.resolveDotDelimited(replacements[dotDelimited[0]], value)
        }
      }
    }

    return obj
  }
}

const isMatch = (descriptor: any, match: any): boolean => {
  return Object.entries(match).every(([key, value]) => {
    let obj = descriptor

    for (const prop of key.split('.')) {
      obj = obj[prop]
      if (obj === undefined) return false
    }

    return obj === value
  })
}

export class DwnProxyProtocols extends DwnProxy {
  #action = {
    httpRequest: async (params) => {
      const res = await fetch(params.endpoint, {
        method : params.method,
        body   : params.body ? JSON.stringify(params.body) : undefined
      })

      if (res.headers.has('content-length') && res.headers.get('content-length') !== '0')
        return await res.json()
    },
    createRecordsWriteMessage: async (params) => {
      return (await RecordsWrite.create({
        ...params,
        data                        : Buffer.from(JSON.stringify(params.data), 'utf-8'),
        authorizationSignatureInput : this.options.didState!.signatureInput
      })).message
    },
    processMessage: async (params) => {
      return await this.dwn.processMessage(
        this.options.didState!.id,
        params.message,
        params.data ? Readable.from(JSON.stringify(params.data)) as IsomorphicReadable : undefined)
    },
    queryRecord: async (params) => {
      // TODO assumption!
      const message = (await RecordsQuery.create({
        ...params,
        authorizationSignatureInput : this.options.didState!.signatureInput,
        dateSort                    : 'createdAscending'
      })).message
      const { entries } = await this.dwn.processMessage(this.options.didState!.id, message)
      if (!entries) return undefined
      return entries[entries.length - 1]
    },
    sendDwnRequest: async (params) => {
      await this.client.send(params.to, params.message, JSON.stringify(params.data))
    }
  }

  #handleAction = async (action: any): Promise<any> => {
    switch (action.action) {
      case 'httpRequest()':
        return await this.#action.httpRequest(action.params)
      case 'createRecordsWriteMessage()':
        return await this.#action.createRecordsWriteMessage(action.params)
      case 'processMessage()':
        return await this.#action.processMessage(action.params)
      case 'replyToDwnRequest()':
        return action.params
      case 'queryRecord()':
        return await this.#action.queryRecord(action.params)
      case 'sendDwnRequest()':
        return await this.#action.sendDwnRequest(action.params)
      default:
        console.error('Unknown action', action.action)
    }
  }

  #inbound = async (dwnRequest: DwnRequest, actions: Array<any>) => {
    let replacementPool = { '#dwnRequest': dwnRequest }

    for (let action of actions) {
      // we enable previous actions' outputs to be used as inputs to subsequent actions
      action.params = MarkupDotReference.referenceReplace(action.params, replacementPool)

      if (action.action === 'replyToDwnRequest()')
        return action.params

      replacementPool['#' + action.id] = await this.#handleAction(action)
    }

    throw new Error(`Never replied to client`)
  }

  #outbound = async (req: Request, res: Response, actions: Array<any>) => {
    let replacementPool = { '#body': await readReq(req) }

    for (let action of actions) {
      // we enable previous actions' outputs to be used as inputs to subsequent actions
      action.params = MarkupDotReference.referenceReplace(action.params, replacementPool)
      replacementPool['#' + action.id] = await this.#handleAction(action)
    }

    res.status(200)
    res.end()
  }

  async install(protocol: any) {
    await this.dwn.processMessage(
      this.options.didState!.id,
      (await ProtocolsConfigure.create({
        definition                  : protocol.definition,
        authorizationSignatureInput : this.options.didState!.signatureInput
      })).message
    )

    // go ahead and replace any references to the protocol definition
    MarkupDotReference.referenceReplace(protocol.routes, { '#definition': protocol.definition })

    for (const route of protocol.routes) {
      console.log('Configuring route', route.description)

      if (route.direction === 'INBOUND') {
        this.addHandler(
          dwnRequest => isMatch(dwnRequest.message.descriptor, route.match),
          dwnRequest => this.#inbound(dwnRequest, route.actions)
        )
      } else if (route.direction === 'OUTBOUND') {
        if (route.method === 'PUT') {
          this.server.api.put(
            route.path, async (req, res) => await this.#outbound(req, res, route.actions))
        }
      } else {
        throw new Error(`Route direction unsupported ${route.direction}`)
      }
    }
  }
}