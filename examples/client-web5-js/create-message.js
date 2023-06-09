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
/**
 *
  {
    "recordId": "bafyreicpw7gagjb7ikkx4vmntkcvtgqbhtguwzkssxl4udedftiviuu5sa",
    "descriptor": {
      "interface": "Records",
      "method": "Write",
      "dataCid": "bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e",
      "dataSize": 11,
      "dateCreated": "2023-06-09T12:40:12.819412Z",
      "dateModified": "2023-06-09T12:40:12.819412Z",
      "dataFormat": "text/plain"
    },
    "authorization": {
      "payload": "eyJyZWNvcmRJZCI6ImJhZnlyZWljcHc3Z2FnamI3aWtreDR2bW50a2N2dGdxYmh0Z3V3emtzc3hsNHVkZWRmdGl2aXV1NXNhIiwiZGVzY3JpcHRvckNpZCI6ImJhZnlyZWloa3RidmF2ZXZuZnV6c2xqN3kzNW1zMzYzZWlmaXg0ZWl0ZTdic3BxNHVwazRhN29rdzRhIn0",
      "signatures": [
        {
          "protected": "eyJhbGciOiJzZWNwMjU2azEiLCJraWQiOiJkaWQ6aW9uOkVpQ0lxWUN2c3dQcFhrUmpvb3VteDhKZ2h1WkVmWW1mY0REZ0JsUlVZRGVpa2c6ZXlKa1pXeDBZU0k2ZXlKd1lYUmphR1Z6SWpwYmV5SmhZM1JwYjI0aU9pSnlaWEJzWVdObElpd2laRzlqZFcxbGJuUWlPbnNpY0hWaWJHbGpTMlY1Y3lJNlczc2lhV1FpT2lKa2QyNGlMQ0p3ZFdKc2FXTkxaWGxLZDJzaU9uc2lZM0oySWpvaWMyVmpjREkxTm1zeElpd2lhM1I1SWpvaVJVTWlMQ0o0SWpvaWFFZFFXSE52ZVhKS1RuaDBPVk5NY0VabFpWSXRhVk16ZEZGSmEwa3pkR2hvVTA1aGJ6UnZiM1ZqWnlJc0lua2lPaUpOWjJwcmIybE9PVkJ3YlhOdGVHeFBjRU0wV0RKblNYaHhlWGN4TjNWcU5VMDRUbGg0WTNOQ1VrVnpJbjBzSW5CMWNuQnZjMlZ6SWpwYkltRjFkR2hsYm5ScFkyRjBhVzl1SWwwc0luUjVjR1VpT2lKS2MyOXVWMlZpUzJWNU1qQXlNQ0o5WFN3aWMyVnlkbWxqWlhNaU9sdDdJbWxrSWpvaVpIZHVJaXdpYzJWeWRtbGpaVVZ1WkhCdmFXNTBJanA3SW01dlpHVnpJanBiSW1oMGRIQTZMeTlzYjJOaGJHaHZjM1E2SWwxOUxDSjBlWEJsSWpvaVJHVmpaVzUwY21Gc2FYcGxaRmRsWWs1dlpHVWlmVjE5ZlYwc0luVndaR0YwWlVOdmJXMXBkRzFsYm5RaU9pSkZhVUZaUmt3elFqTmxhR0prUzJ0SU5XUTJaMUJaYkhOVVVuaFNTelJzT1hOclZWOUJRazlYY0RaaFJFNTNJbjBzSW5OMVptWnBlRVJoZEdFaU9uc2laR1ZzZEdGSVlYTm9Jam9pUldsRFkyazJaRGR1ZDAweVl6RmxVMnRITm5Odk1GbFlNVVZrUWs4MlNTMVBlVVpZWW1oT2FYSmFSbEUwUVNJc0luSmxZMjkyWlhKNVEyOXRiV2wwYldWdWRDSTZJa1ZwUVUxZlQwTTBlbGwwUzIxbVMwMVRSVVZvUW5VM2RrbFJUMGhZWkhrMlNXaHJUM2xTV0hVNFpqTlZiV2NpZlgwI2RpZDppb246RWlDSXFZQ3Zzd1BwWGtSam9vdW14OEpnaHVaRWZZbWZjRERnQmxSVVlEZWlrZzpleUprWld4MFlTSTZleUp3WVhSamFHVnpJanBiZXlKaFkzUnBiMjRpT2lKeVpYQnNZV05sSWl3aVpHOWpkVzFsYm5RaU9uc2ljSFZpYkdsalMyVjVjeUk2VzNzaWFXUWlPaUprZDI0aUxDSndkV0pzYVdOTFpYbEtkMnNpT25zaVkzSjJJam9pYzJWamNESTFObXN4SWl3aWEzUjVJam9pUlVNaUxDSjRJam9pYUVkUVdITnZlWEpLVG5oME9WTk1jRVpsWlZJdGFWTXpkRkZKYTBremRHaG9VMDVoYnpSdmIzVmpaeUlzSW5raU9pSk5aMnByYjJsT09WQndiWE50ZUd4UGNFTTBXREpuU1hoeGVYY3hOM1ZxTlUwNFRsaDRZM05DVWtWekluMHNJbkIxY25CdmMyVnpJanBiSW1GMWRHaGxiblJwWTJGMGFXOXVJbDBzSW5SNWNHVWlPaUpLYzI5dVYyVmlTMlY1TWpBeU1DSjlYU3dpYzJWeWRtbGpaWE1pT2x0N0ltbGtJam9pWkhkdUlpd2ljMlZ5ZG1salpVVnVaSEJ2YVc1MElqcDdJbTV2WkdWeklqcGJJbWgwZEhBNkx5OXNiMk5oYkdodmMzUTZJbDE5TENKMGVYQmxJam9pUkdWalpXNTBjbUZzYVhwbFpGZGxZazV2WkdVaWZWMTlmVjBzSW5Wd1pHRjBaVU52YlcxcGRHMWxiblFpT2lKRmFVRlpSa3d6UWpObGFHSmtTMnRJTldRMloxQlpiSE5VVW5oU1N6UnNPWE5yVlY5QlFrOVhjRFpoUkU1M0luMHNJbk4xWm1acGVFUmhkR0VpT25zaVpHVnNkR0ZJWVhOb0lqb2lSV2xEWTJrMlpEZHVkMDB5WXpGbFUydEhObk52TUZsWU1VVmtRazgyU1MxUGVVWllZbWhPYVhKYVJsRTBRU0lzSW5KbFkyOTJaWEo1UTI5dGJXbDBiV1Z1ZENJNklrVnBRVTFmVDBNMGVsbDBTMjFtUzAxVFJVVm9RblUzZGtsUlQwaFlaSGsyU1doclQzbFNXSFU0WmpOVmJXY2lmWDAjZHduIn0",
          "signature": "ExrvXS34lA_UppnBFYdl2DacBS3PIHpU-3WfxQD_xyE34iOpDdYmkAC__3PZF0ugR2lHi9xqO8mHTmssxZ5QOg"
        }
      ]
    }
  }
 */
