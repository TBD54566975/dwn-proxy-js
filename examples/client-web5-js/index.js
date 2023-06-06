import { Web5 } from '@tbd54566975/web5';

const proxyDid = 'did:ion:EiDfo4QKyH_Njm9cPYXQFk3CKvqp_DUnJs4oppFBquFxQQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiZzNFeXBxQWFVVkdMS0RQYUlkMWRYX3hxTXJoX2s5TUJLRUdXN0swNlRGdyIsInkiOiJYMUYwNEc0LUttVHpVOVJMUzdoTnFRVnFoRGFYcEl0c3ZTdVZlQjJlc1o0In0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlBdWxFd0ZCVVFQTjFuazlLMThoUWtXdlhULXFYVHJwMnNXZHFEU0tUTWhRdyJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpRGdST2JITjBoTEpJeEtOeVJMNW9PYnFzS2FUQVBJMVJGVkdYaDRoQTE5b1EiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUJuOGNsQUJGbER5emRRdWxYSTR1dGxGaS1na3RQcVVBRzRsUzQ3cnpra213In19';

const { web5, did: myDid } = await Web5.connect();

// this creates a record and stores it in the user's local DWeb Node
const { record } = await web5.dwn.records.create({
  data    : 'Hello World!',
  message : {
    dataFormat: 'text/plain',
  },
});

console.log(await record.data.text()); // logs "Hello World!"
const { status: status1 } = await record.send(myDid); // send the record to the user's remote DWeb Nodes
console.log(status1);
const { status } = await record.send(proxyDid); // send the newly generated record to Bo
console.log(status);
