import { ProtocolsConfigure } from '@tbd54566975/dwn-sdk-js'
import type { ProtocolDefinition }from '@tbd54566975/dwn-sdk-js'
import { DwnProxy } from './dwn-proxy.js'
import type { DwnRequest } from './dwn-types.js'
import type { Request, Response } from 'express'

export const DIRECTION = {
  inbound  : 'INBOUND',
  outbound : 'OUTBOUND'
}

export const ACTION = {
  httpRequest: 'HTTP_REQUEST'
}

export type Action = {
  id: string
  description: string
  action: string
  params: any
}

export type Route = {
  description: string
  direction: string
  actions: Array<Action>
}

export type Match = {
  interface: string
  method: string
  [key: string]: any
}

export type InboundRoute = Route & {
  match: Match
}

export type OutboundRoute = Route & {
  method: string
  path: string
}

export type DwnProxyProtocol = {
  definition: ProtocolDefinition
  routes: Array<InboundRoute | OutboundRoute>
}

const resolveDotDelimited = (obj, value) => {
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

const referenceReplace = (obj, replacements = {}) => {
  // ensure the protocol definition is in the possible replacements
  if (!replacements['#definition']) replacements['#definition'] = pfiProtocolDefinition

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      obj[key] = referenceReplace(value, replacements)
    } else if (typeof value === 'string' && value[0] === '#') {
      const dotDelimited = value.split('.')
      if (dotDelimited.length === 1) {
        obj[key] = replacements[value]
      } else {
        obj[key] = resolveDotDelimited(replacements[dotDelimited[0]], value)
      }
    }
  }

  return obj
}

const isMatch = (descriptor, match) => {
  match = referenceReplace(match)
  return Object.entries(match).every(([key, value]) => {
    let obj = descriptor

    for (const prop of key.split('.')) {
      obj = obj[prop]
      if (obj === undefined) return false
    }

    return obj === value
  })
}

export class DwnProxyMarkup extends DwnProxy {
  #inbound = async (dwnRequest: DwnRequest, actions: Array<Action>) => {
    console.log(dwnRequest, actions)
  }

  #outbound = async (req: Request, res: Response, actions: Array<Action>) => {
    console.log(req, res, actions)
  }

  async install(protocol: DwnProxyProtocol) {
    await this.init()

    await this.dwn.processMessage(
      this.options.didState!.id,
      (await ProtocolsConfigure.create({
        definition                  : protocol.definition,
        authorizationSignatureInput : this.options.didState!.signatureInput
      })).message
    )

    for (const route of protocol.routes) {
      console.log('Configuring route', route.description)

      if (route.direction === DIRECTION.inbound) {
        this.addHandler(
          dwnRequest => isMatch(dwnRequest.message.descriptor, (route as InboundRoute).match),
          dwnRequest => this.#inbound(dwnRequest, route.actions)
        )
      } else if (route.direction === DIRECTION.outbound) {
        if ((route as OutboundRoute).method === 'PUT') {
          this.server.api.put(
            (route as OutboundRoute).path, async (req, res) => await this.#outbound(req, res, route.actions))
        }
      } else {
        throw new Error(`Route direction unsupported ${route.direction}`)
      }
    }
  }
}