import { DidIonApi } from '@tbd54566975/dids'
import { DidStateWithSignatureInput } from './dwn-types.js'

export const generateDidState = async (endpoint: string): Promise<DidStateWithSignatureInput> => {
  const didState = await new DidIonApi().create({
    services: [{
      id              : 'dwn',
      type            : 'DecentralizedWebNode',
      serviceEndpoint : {
        nodes: [ endpoint ]
      }
    }]
  })

  console.log(`Created DID & hosting service endpoint at ${endpoint}`)
  console.log(didState.id)

  const { keys } = didState
  const [ key ] = keys
  const { privateKeyJwk } = key
  const kidFragment = privateKeyJwk.kid || key.id
  const kid = `${didState.id}#${kidFragment}`
  return {
    ...didState,
    signatureInput: {
      privateJwk      : privateKeyJwk,
      protectedHeader : { alg: privateKeyJwk.crv, kid }
    }
  }
}