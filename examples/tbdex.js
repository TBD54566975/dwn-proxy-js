import { ProtocolsConfigure, RecordsWrite } from '@tbd54566975/dwn-sdk-js'
import { DwnProxy } from '../dist/esm/main.mjs'
import { pfiProtocolDefinition } from './tbdex-protocol-definitions.js'
import config from './tbdex.dpml.json' assert { type: 'json' }
import { Readable } from 'node:stream'

const PORT = 8080
const didState = {
  id             : 'did:ion:EiDej1VG5MfG7A4s9cPDXxiTrP2AwvyCZ1y4H3s_ctCW_g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiSUZMcXU0MzJQamNPa0dGT28tNXFtcFFSTmtOTnhoaW0wTFNsTjA4dmdxZyIsInkiOiJYc0dfdXQ4S0Vpdm5UbkVqODlYVWRYRFpUb2E5LTh0amhMelNCZUpzLUhZIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRE1ZS2RvVTBLMHZQTzRhNWVNUVpWaExqdXFOZzlJY0lvWDRFQzRPV1dXUVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFwYWJJeDNBVUYxWUw0MXFxU2kzNW13TnMySDdLR2duX2ZBeV9Sa2JXX1FnIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEMlc0TWVsVzU3YjBrSVlVOFp3a1RuSW96RnpQcXlCc3R2UXNEeFFBQ1J4dyJ9fQ',
  signatureInput : JSON.parse('{"privateJwk":{"kty":"EC","crv":"secp256k1","x":"IFLqu432PjcOkGFOo-5qmpQRNkNNxhim0LSlN08vgqg","y":"XsG_ut8KEivnTnEj89XUdXDZToa9-8tjhLzSBeJs-HY","d":"IqQJpnTHVAjgfnJLtaNXlLoI7WQGgJ8fyEU4Rxaf0PE"},"protectedHeader":{"alg":"secp256k1","kid":"did:ion:EiDej1VG5MfG7A4s9cPDXxiTrP2AwvyCZ1y4H3s_ctCW_g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiSUZMcXU0MzJQamNPa0dGT28tNXFtcFFSTmtOTnhoaW0wTFNsTjA4dmdxZyIsInkiOiJYc0dfdXQ4S0Vpdm5UbkVqODlYVWRYRFpUb2E5LTh0amhMelNCZUpzLUhZIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRE1ZS2RvVTBLMHZQTzRhNWVNUVpWaExqdXFOZzlJY0lvWDRFQzRPV1dXUVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFwYWJJeDNBVUYxWUw0MXFxU2kzNW13TnMySDdLR2duX2ZBeV9Sa2JXX1FnIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEMlc0TWVsVzU3YjBrSVlVOFp3a1RuSW96RnpQcXlCc3R2UXNEeFFBQ1J4dyJ9fQ#did:ion:EiDej1VG5MfG7A4s9cPDXxiTrP2AwvyCZ1y4H3s_ctCW_g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiSUZMcXU0MzJQamNPa0dGT28tNXFtcFFSTmtOTnhoaW0wTFNsTjA4dmdxZyIsInkiOiJYc0dfdXQ4S0Vpdm5UbkVqODlYVWRYRFpUb2E5LTh0amhMelNCZUpzLUhZIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRE1ZS2RvVTBLMHZQTzRhNWVNUVpWaExqdXFOZzlJY0lvWDRFQzRPV1dXUVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFwYWJJeDNBVUYxWUw0MXFxU2kzNW13TnMySDdLR2duX2ZBeV9Sa2JXX1FnIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEMlc0TWVsVzU3YjBrSVlVOFp3a1RuSW96RnpQcXlCc3R2UXNEeFFBQ1J4dyJ9fQ#dwn"}}')
}
const proxy = new DwnProxy({
  didState
})

const isMatch = (descriptor, match) => {
  return Object.entries(match).every(([key, value]) => {
    let obj = descriptor

    // Traverse the property chain to get the value from the dwnRequest
    for (const prop of key.split('.')) {
      obj = obj[prop]
      if (obj === undefined) {
        return false
      }
    }

    // Resolve special '#protocolDefinition' references
    if (typeof value === 'string' && value.startsWith('#protocolDefinition.')) {
      const propChain = value.split('.').slice(1)
      let protoValue = pfiProtocolDefinition
      for (let prop of propChain) {
        protoValue = protoValue[prop]
        if (protoValue === undefined) {
          return false
        }
      }
      value = protoValue
    }

    // Check equality
    return obj === value
  })
}

const httpRequest = async (params) => {
  const res = await fetch(params.endpoint, {
    method : params.method,
    body   : params.body ? JSON.stringify(params.body) : undefined
  })

  return await res.json()
}

const createRecordsWrite = async (params) => {
  return await RecordsWrite.create({
    ...params,
    data                        : Buffer.from(JSON.stringify(params.data), 'utf-8'),
    authorizationSignatureInput : didState.signatureInput
  })
}

const processMessage = async (params) => {
  return await proxy.dwn.processMessage(
    didState.id,
    params.message,
    params.data ? Readable.from(JSON.stringify(params.data)) : undefined)
}

const inboundHandler = async (dwnRequest, actions) => {
  let outputs = {}
  for (let action of actions) {
    console.log('Executing action', action.action)

    // replace any # references
    for (const [key, value] of Object.entries(action.params)) {
      if (value[0] === '#') {
        if (value === '#inboundDwnRequest.message') {
          action.params[key] = dwnRequest.message
        } else if (value === '#inboundDwnRequest.data') {
          action.params[key] = dwnRequest.data
        } else {
          if (outputs[value]) {
            action.params[key] = outputs[value]
          } else {
            throw new Error(`Unknown special value ${key}:${value}`)
          }
        }
      }
    }
    console.log(outputs, action.params)

    // handle action
    switch (action.action) {
      case 'httpRequest()':
        outputs['#' + action.id] = await httpRequest(action.params)
        break
      case 'createRecordsWrite()':
        outputs['#' + action.id] = await createRecordsWrite(action.params)
        break
      case 'processMessage()':
        outputs['#' + action.id] = await processMessage(action.params)
        break
      case 'replyToDwnRequest()':
        return action.params
      default:
        console.log('Unknown action', action.action)
    }
  }

  throw new Error(`Never replied to client`)
}

const main = async () => {
  for (const route of config.routes) {
    console.log('Configuring route', route.description)

    if (route.direction === 'INBOUND') {
      proxy.addHandler(
        dwnRequest => isMatch(dwnRequest.message.descriptor, route.match),
        dwnRequest => inboundHandler(dwnRequest, route.actions)
      )
    } else if (route.direction === 'OUTBOUND') {
      // todo
    } else {
      throw new Error(`Route direction unsupported ${route.direction}`)
    }
  }

  await proxy.listen(PORT)

  // todo use dpml declaration
  await proxy.dwn.processMessage(
    didState.id,
    (await ProtocolsConfigure.create({
      definition                  : pfiProtocolDefinition,
      authorizationSignatureInput : didState.signatureInput
    })).message
  )
}

main()
