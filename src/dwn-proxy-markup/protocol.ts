import type { ProtocolDefinition } from '@tbd54566975/dwn-sdk-js'

type Params = {
  [key: string]: any
}

type Action = {
  id: string;
  description: string;
  action: string;
  params: Params;
}

type Match = {
    interface: string
    method: string
    [key: string]: any
}

export class Route {
  description: string
  direction: string
  match?: Match
  method?: string
  path?: string
  actions: Action[]

  fillAnyReferences = (replacementPool: any) => {

  }
}

export class Protocol {
  definition: ProtocolDefinition
  routes: Array<Route>

  constructor(protocol: any) {
    this.definition = protocol.definition
    this.routes = protocol.routes
  }

  // static create(protocol: any): Protocol {
  //   // todo iterate through and type everything
  //   // todo go ahead and replace every instance of #definition reference
  // }
}