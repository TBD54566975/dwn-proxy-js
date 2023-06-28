import { RecordsWriteMessage } from '@tbd54566975/dwn-sdk-js'
import { DidIonApi, DwnServiceEndpoint } from '@tbd54566975/dids'
import { createRequest } from './dwn-json-rpc.js'

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

  send = async (target: string, message: RecordsWriteMessage, data?: string): Promise<void> => {
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

    const resp = await fetch(endpoint, fetchOpts)
    console.log('kw dbg', resp.status)
  }
}