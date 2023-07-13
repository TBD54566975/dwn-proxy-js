import { MarkupDotReference } from './markup-dot-reference.js'

export interface IProtocolRouteMatch {
  interface: string
  method: string
  [key: string]: any
}

export class ProtocolRouteMatch implements IProtocolRouteMatch {
  interface: string
  method: string
  [key: string]: any

  constructor(match: IProtocolRouteMatch) {
    Object.assign(this, match)
  }

  static create(match: IProtocolRouteMatch): ProtocolRouteMatch {

  }
}