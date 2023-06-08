import { RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import { DidIonApi } from '@tbd54566975/dids';

const didState = await new DidIonApi().create({
  services: [{
    id              : 'dwn',
    type            : 'DecentralizedWebNode',
    serviceEndpoint : {
      nodes: [ `http://localhost:` ]
    }
  }]
});

const { keys } = didState;
const [ key ] = keys;
const { privateKeyJwk } = key;
const kidFragment = privateKeyJwk.kid || key.id;
const kid = `${didState.id}#${kidFragment}`;
const dwnSignatureInput = {
  privateJwk      : privateKeyJwk,
  protectedHeader : { alg: privateKeyJwk.crv, kid }
};

const message = await RecordsWrite.create({
  data                        : Buffer.from('hello world', 'utf-8'),
  dataFormat                  : 'text/plain',
  authorizationSignatureInput : dwnSignatureInput
});
console.log(message);
