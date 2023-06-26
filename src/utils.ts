import { DidIonApi } from '@tbd54566975/dids'
import { DidStateWithSignatureInput } from './types.js'

export const generateDid = async (endpoint: string): Promise<DidStateWithSignatureInput> => {
  const didState = await new DidIonApi().create({
    services: [{
      id              : 'dwn',
      type            : 'DecentralizedWebNode',
      serviceEndpoint : {
        nodes: [ endpoint ]
      }
    }]
  })

  console.log(`Created DID and hosting: ${didState.id}`)

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