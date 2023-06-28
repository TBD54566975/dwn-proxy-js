import { RecordsWriteMessage } from '@tbd54566975/dwn-sdk-js'
import { DidIonApi, DwnServiceEndpoint } from '@tbd54566975/dids'
import { createRequest, parseResponse } from './dwn-json-rpc.js'
import { DwnResponse } from './dwn-types.js'

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

  send = async (target: string, message: RecordsWriteMessage, data?: string): Promise<DwnResponse> => {
    const endpoint = await this.#resolveEndpoint(target)

    const fetchOpts = {
      method  : 'POST',
      headers : {
        'dwn-request': JSON.stringify(createRequest(target, message))
      }
    }
    if (data) {
      fetchOpts.headers['content-type'] = 'application/octet-stream'
      fetchOpts['body'] = data
    }

    const res =  await fetch(endpoint, fetchOpts)

    let dwnResponse: DwnResponse
    if (res.headers.has('dwn-response')) {
      dwnResponse = parseResponse(JSON.parse(res.headers.get('dwn-response')))
    } else {
      dwnResponse = parseResponse(JSON.parse(await res.text()))
    }

    return dwnResponse
  }
}