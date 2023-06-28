import { DwnInterfaceName, DwnMethodName, RecordsQuery, RecordsQueryMessage, RecordsWrite } from '@tbd54566975/dwn-sdk-js'
import DwnProxy, { DwnProxyOptions } from './dwn-proxy.js'
import { DwnRequest, DwnResponse } from './dwn-types.js'
import { Readable } from 'node:stream'
import type { Readable as IsomorphicReadable } from 'readable-stream'

const isOffering = (dwnRequest: DwnRequest): boolean =>
  dwnRequest.message.descriptor.interface === DwnInterfaceName.Records &&
  dwnRequest.message.descriptor.method === DwnMethodName.Query &&
  (dwnRequest.message as RecordsQueryMessage).descriptor.filter.schema === 'https://tbd.website/resources/tbdex/Offering'

const isRfq = (dwnRequest: DwnRequest): boolean =>
  dwnRequest.message.descriptor.interface === DwnInterfaceName.Records &&
  dwnRequest.message.descriptor.method === DwnMethodName.Write &&
  dwnRequest.message.descriptor.protocol === 'TBDex' &&
  dwnRequest.message.descriptor.protocolPath === 'RFQ' &&
  dwnRequest.message.descriptor.schema === 'https://tbd.website/protocols/tbdex/RFQ'

class TbdPfiDwnProxy extends DwnProxy {
  /** configure protocol */
  /** map requests to functions */

  constructor(options: DwnProxyOptions) {
    super(options)

    this.inboundHandlers.push(req => isOffering(req) ? this.offering : undefined)
    this.inboundHandlers.push(req => isRfq(req) ? this.rfq : undefined)
  }

  offering = async (request: DwnRequest): Promise<DwnResponse | void> => {
    console.log('Handling offering', request)
    /**
     * - fetch from backend
     * - write record (publish: true)
     * - return record
     */
    // const res = await fetch('backend/offering')
    // const offering = await res.json()

    const offering = {
      description            : 'test offering',
      pair                   : 'USD_BTC',
      unitPrice              : '100',
      min                    : '0',
      max                    : '1000',
      presentationRequestJwt : 'testjwt',
      payinInstruments       : [],
      payoutInstruments      : []
    }

    const dataStream = Readable.from(JSON.stringify(offering))

    const record = await RecordsWrite.create({
      published                   : true,
      data                        : Buffer.from(JSON.stringify(offering), 'utf-8'),
      dataFormat                  : 'application/json',
      authorizationSignatureInput : this.options.didState.signatureInput,
      schema                      : 'https://tbd.website/resources/tbdex/Offering'
    })

    await this.dwn.processMessage(this.options.didState.id, record.message, dataStream as IsomorphicReadable)

    const reply = await this.dwn.processMessage(this.options.didState.id, request.message)
    console.log(reply)

    return {
      reply
    }
  }

  rfq = async () => {
    console.log('todo')
    /**
     * - fetch to backend
     * - reply 202
     */
  }

  quote = async () => {
    console.log('todo')
    /**
     * - write rfq record
     * - write quote record
     * - send quote
     */
  }

  orderStatus = async () => {
    console.log('todo')
    /**
     * - write orderstatus record
     * - send orderstatus
     */
  }
}

const main = async () => {
  const PORT = 8080
  const proxy = new TbdPfiDwnProxy({
    didState: {
      id             : 'did:ion:EiAa9MrFYwq5yijdGk0beMqwEA_yqakNqkUoD7Giq7q3vg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoibTRCQUVnMHhZZWlsaFFzZkVxYk92Y3dYZjdZbUxtOWNRTUNIY21fUFMwayIsInkiOiJGSDRBQkxIYjVabjV1NWt5UDFKVExTUnJJQnhrSWRicUhjdUw2WGkzM01jIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRFdvVXg0Qm9OZmJxbEppVDZoLWdzVE41NWtnWEVpZXBqOHR4RGVrODZHeEEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaURTZy00QmtRUFliUUp3aDZPR3lXZjR4QWlDa29IeU15U2p4WHNJMkRHMm9nIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlDQnJySmduaUZHcmV2U1J6YkI2WEFNRW1PbzMtRmx2eFNtdHIwbnhiZ3VWUSJ9fQ',
      signatureInput : JSON.parse('{"privateJwk":{"kty":"EC","crv":"secp256k1","x":"m4BAEg0xYeilhQsfEqbOvcwXf7YmLm9cQMCHcm_PS0k","y":"FH4ABLHb5Zn5u5kyP1JTLSRrIBxkIdbqHcuL6Xi33Mc","d":"tf-b79RSmA5VCdWH1PuZnGImQZLDtRT7iNRtE9O-ql8"},"protectedHeader":{"alg":"secp256k1","kid":"did:ion:EiAa9MrFYwq5yijdGk0beMqwEA_yqakNqkUoD7Giq7q3vg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoibTRCQUVnMHhZZWlsaFFzZkVxYk92Y3dYZjdZbUxtOWNRTUNIY21fUFMwayIsInkiOiJGSDRBQkxIYjVabjV1NWt5UDFKVExTUnJJQnhrSWRicUhjdUw2WGkzM01jIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRFdvVXg0Qm9OZmJxbEppVDZoLWdzVE41NWtnWEVpZXBqOHR4RGVrODZHeEEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaURTZy00QmtRUFliUUp3aDZPR3lXZjR4QWlDa29IeU15U2p4WHNJMkRHMm9nIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlDQnJySmduaUZHcmV2U1J6YkI2WEFNRW1PbzMtRmx2eFNtdHIwbnhiZ3VWUSJ9fQ#did:ion:EiAa9MrFYwq5yijdGk0beMqwEA_yqakNqkUoD7Giq7q3vg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoibTRCQUVnMHhZZWlsaFFzZkVxYk92Y3dYZjdZbUxtOWNRTUNIY21fUFMwayIsInkiOiJGSDRBQkxIYjVabjV1NWt5UDFKVExTUnJJQnhrSWRicUhjdUw2WGkzM01jIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRFdvVXg0Qm9OZmJxbEppVDZoLWdzVE41NWtnWEVpZXBqOHR4RGVrODZHeEEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaURTZy00QmtRUFliUUp3aDZPR3lXZjR4QWlDa29IeU15U2p4WHNJMkRHMm9nIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlDQnJySmduaUZHcmV2U1J6YkI2WEFNRW1PbzMtRmx2eFNtdHIwbnhiZ3VWUSJ9fQ#dwn"}}')
    }
  })
  await proxy.listen(PORT)
}

main()