import { Web5 } from '@tbd54566975/web5';

const proxyDid = 'did:ion:EiBnrXV07hLOb3PrYB7sD7YRK6L1jpRZ0bk_ORmm7ZfG2w:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiX21ZN0ZnQnBRblVrYjAtWHRCSWtRbjU1NEtiTGltVzByTnlEVlFzSXRZYyIsInkiOiJVOGwzV2VaU09Ib0lTY081b1hqVnB3cHJJSU4yTnJYd2tsclRhSHRqY2NRIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCN3lHUHlvS2E0bUxMdWFJc1BBeVZjZ1VxOU5hakE0a3ZoUXdVQXRONjFiZyJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQ2tjOExOZm9hMmVCbHV4ZzFPdEJacFl3QXc1ZUNZamhrbnQ2VWtIWC0tbkEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaURlLWxtbnMzYmtzX0l4eFZHazRmVkRpejNNR2NFWHgxWTZfNm1rbEs2dkNRIn19';

const { web5 } = await Web5.connect();

// this creates a record and stores it in the user's local DWeb Node
const { record } = await web5.dwn.records.create({
  data    : 'Hello World!',
  message : {
    dataFormat: 'text/plain',
  },
});

const { status } = await record.send(proxyDid); // send the newly generated record to Bo
console.log(status);

