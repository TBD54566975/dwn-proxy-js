import { RecordsWriteMessage } from '@tbd54566975/dwn-sdk-js'
import { DidIonApi, DwnServiceEndpoint } from '@tbd54566975/dids'
import { createJsonRpcRequest, parseJsonRpcErrorResponse, parseJsonRpcResponse } from './dwn-json-rpc.js'
import type { DwnResponse } from './dwn-request-response.js'

export class DwnHttpClient {
  // TODO did resolver cache member variable

  #resolveEndpoint = async (did: string): Promise<string> => {
    // TODO use resolver cache
    const doc = (await new DidIonApi().resolve(did)).didDocument
    if (!doc) throw new Error() // TODO
    const service = doc.service?.find(x => x.type === 'DecentralizedWebNode')
    if (!service) throw new Error() // TODO
    return (service.serviceEndpoint as DwnServiceEndpoint).nodes[0]
  }

  send = async (target: string, message: RecordsWriteMessage, payload?: string): Promise<DwnResponse> => {
    const endpoint = await this.#resolveEndpoint(target)

    const fetchOpts = {
      method  : 'POST',
      headers : {
        'dwn-request': JSON.stringify(createJsonRpcRequest(target, message))
      }
    }
    if (payload) {
      fetchOpts.headers['content-type'] = 'application/octet-stream'
      fetchOpts['body'] = payload
    }

    const res =  await fetch(endpoint, fetchOpts)

    const jsonRpcResponse = JSON.parse(
      res.headers.has('dwn-response') ? res.headers.get('dwn-response') as string : await res.text())

    const dwnResponse = parseJsonRpcResponse(jsonRpcResponse)

    if (!dwnResponse)
      throw new Error(`DwnResponse returned error ${JSON.stringify(parseJsonRpcErrorResponse(jsonRpcResponse))}`)

    return dwnResponse
  }
}