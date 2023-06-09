import { RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import { DidIonApi } from '@tbd54566975/dids';

const aliceDid = 'did:ion:EiBk840E9pN1Z0qcMwTvUkkoMVyX8YlCas9rU0tju_KcrQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoeiIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJCVDh2aC1SVUJodjZsRzVFd1VDQ0dYcG1xOVJwTmxudFFMTjlXYU9sTE84IiwieSI6IkYtZkRCT0NBbXF3SHBlV0Y1MnhvSV9sbkNOeEl1bWNXTUxkS1pQcHZOSk0ifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iXSwidHlwZSI6Ikpzb25XZWJLZXkyMDIwIn0seyJpZCI6ImVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJQNUg4eHJfX1Q3UW4tU0RIOV9OSVVyZjZfc0dEcjRtdnhrcy0waVVfQnRJIiwieSI6IlRmcHBuVjIwWXNBWnpOR2JubUFDdHRadXRneUZFUnRqVUQ1QnJkVTZJRkkifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im1lc3NhZ2VBdXRob3JpemF0aW9uS2V5cyI6WyIjYXV0aHoiXSwibm9kZXMiOlsiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd241IiwiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd242Il0sInJlY29yZEVuY3J5cHRpb25LZXlzIjpbIiNlbmMiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRFNONFQ3TEd2bzdLX1E1Q3BVS0J6WGFqdmN2WjJLUW40OHNPY1NDRVJiVVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUJrWGlEdlQ5TmhjaTFabjJkMnYxcGhneUo2R2NEczMtb1F5WGhJX2xXalZBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlBZ0FZdE5nRkI3VFRiTy1KLU5aMzYzMVpGNjVkZjk1X2VVbll6OUtIU1FSZyJ9fQ';

const data = Buffer.from('hello world', 'utf-8');
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
  data                        : data,
  dataFormat                  : 'text/plain',
  authorizationSignatureInput : dwnSignatureInput
});

const dwnRequest = {
  'jsonrpc' : '2.0',
  'id'      : '90a7309e-d5ad-4404-b609-7d050a1dff17',
  'method'  : 'dwn.processMessage',
  'params'  : {
    target: aliceDid,
    message
  }
};

const aliceDidDoc = await new DidIonApi().resolve(aliceDid);
const endpoint = aliceDidDoc.didDocument.service.find(x => x.type === 'DecentralizedWebNode').serviceEndpoint.nodes[0];

async function streamToString(readableStream) {
  const reader = readableStream.getReader();
  let result = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    result += new TextDecoder('utf-8').decode(value);
  }

  return result;
}


const fetchOpts = {
  method  : 'POST',
  headers : {
    'dwn-request'  : JSON.stringify(dwnRequest),
    'content-type' : 'application/octet-stream'
  },
  body: data
};
const resp = await fetch(endpoint, fetchOpts);
console.log('Response status:', resp.status);
console.log('Response headers:', resp.headers);
console.log('Response body:', await streamToString(resp.body));

/**
 *
  {
    "jsonrpc": "2.0",
    "id": "90a7309e-d5ad-4404-b609-7d050a1dff17",
    "result": {
      "reply": {
        "status": {
          "code": 401,
          "detail": "message failed authorization, permission grant check not yet implemented"
        }
      }
    }
  }
 */
