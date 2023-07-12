import { DwnProxy } from '../dist/esm/main.mjs'
import { pfiProtocolDefinition } from './tbdex-protocol-definitions.js'
import config from './tbdex.dpml.json' assert { type: 'json' }

const isMatch = (dwnRequest, matchObj) => {
  return Object.entries(matchObj).every(([key, value]) => {
    let obj = dwnRequest

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


const inboundHandler = (dwnRequest, actions) => {
  console.log(dwnRequest, actions)
}

const main = async () => {
  const PORT = 8080
  const didState = {
    id             : 'did:ion:EiDej1VG5MfG7A4s9cPDXxiTrP2AwvyCZ1y4H3s_ctCW_g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiSUZMcXU0MzJQamNPa0dGT28tNXFtcFFSTmtOTnhoaW0wTFNsTjA4dmdxZyIsInkiOiJYc0dfdXQ4S0Vpdm5UbkVqODlYVWRYRFpUb2E5LTh0amhMelNCZUpzLUhZIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRE1ZS2RvVTBLMHZQTzRhNWVNUVpWaExqdXFOZzlJY0lvWDRFQzRPV1dXUVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFwYWJJeDNBVUYxWUw0MXFxU2kzNW13TnMySDdLR2duX2ZBeV9Sa2JXX1FnIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEMlc0TWVsVzU3YjBrSVlVOFp3a1RuSW96RnpQcXlCc3R2UXNEeFFBQ1J4dyJ9fQ',
    signatureInput : JSON.parse('{"privateJwk":{"kty":"EC","crv":"secp256k1","x":"IFLqu432PjcOkGFOo-5qmpQRNkNNxhim0LSlN08vgqg","y":"XsG_ut8KEivnTnEj89XUdXDZToa9-8tjhLzSBeJs-HY","d":"IqQJpnTHVAjgfnJLtaNXlLoI7WQGgJ8fyEU4Rxaf0PE"},"protectedHeader":{"alg":"secp256k1","kid":"did:ion:EiDej1VG5MfG7A4s9cPDXxiTrP2AwvyCZ1y4H3s_ctCW_g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiSUZMcXU0MzJQamNPa0dGT28tNXFtcFFSTmtOTnhoaW0wTFNsTjA4dmdxZyIsInkiOiJYc0dfdXQ4S0Vpdm5UbkVqODlYVWRYRFpUb2E5LTh0amhMelNCZUpzLUhZIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRE1ZS2RvVTBLMHZQTzRhNWVNUVpWaExqdXFOZzlJY0lvWDRFQzRPV1dXUVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFwYWJJeDNBVUYxWUw0MXFxU2kzNW13TnMySDdLR2duX2ZBeV9Sa2JXX1FnIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEMlc0TWVsVzU3YjBrSVlVOFp3a1RuSW96RnpQcXlCc3R2UXNEeFFBQ1J4dyJ9fQ#did:ion:EiDej1VG5MfG7A4s9cPDXxiTrP2AwvyCZ1y4H3s_ctCW_g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiSUZMcXU0MzJQamNPa0dGT28tNXFtcFFSTmtOTnhoaW0wTFNsTjA4dmdxZyIsInkiOiJYc0dfdXQ4S0Vpdm5UbkVqODlYVWRYRFpUb2E5LTh0amhMelNCZUpzLUhZIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRE1ZS2RvVTBLMHZQTzRhNWVNUVpWaExqdXFOZzlJY0lvWDRFQzRPV1dXUVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFwYWJJeDNBVUYxWUw0MXFxU2kzNW13TnMySDdLR2duX2ZBeV9Sa2JXX1FnIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEMlc0TWVsVzU3YjBrSVlVOFp3a1RuSW96RnpQcXlCc3R2UXNEeFFBQ1J4dyJ9fQ#dwn"}}')
  }
  const proxy = new DwnProxy({
    didState
  })

  // todo wire up handlers
  for (const route of config.routes) {
    console.log('Configuring route', route.description)

    if (route.direction === 'INBOUND') {
      proxy.addHandler(
        dwnRequest => isMatch(dwnRequest, route.match),
        dwnRequest => inboundHandler(dwnRequest, route.actions)
      )
    }
  }

  // await proxy.listen(PORT)
}

main()
