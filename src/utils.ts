import { DidIonApi } from '@tbd54566975/dids';
import { SignatureInput } from '@tbd54566975/dwn-sdk-js';

export const generateSignatureInput = async (endpoint: string): Promise<SignatureInput> => {
  const didState = await new DidIonApi().create({
    services: [{
      id              : 'dwn',
      type            : 'DecentralizedWebNode',
      serviceEndpoint : {
        nodes: [ endpoint ]
      }
    }]
  });

  console.log(`Created DID and hosting: ${didState.id}`);

  const { keys } = didState;
  const [ key ] = keys;
  const { privateKeyJwk } = key;
  const kidFragment = privateKeyJwk.kid || key.id;
  const kid = `${didState.id}#${kidFragment}`;
  return {
    privateJwk      : privateKeyJwk,
    protectedHeader : { alg: privateKeyJwk.crv, kid }
  };
};