import { Web5 } from '@tbd54566975/web5';

const proxyDid = 'did:ion:EiBloqwdIB133r51bl3t6RsNdiqo0u6ek1lUeizUbBcvwg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoibWE1cXZWdmhUd2xheUF6VUNEc2lQZWE0bXNFOVFmV01DTlRvVkRnVFphSSIsInkiOiJ2Y19UU2lWd1pYSzhfNk5kVDNucHFnVVktRTRpVUozb2liN281MWw3TjdNIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlDTm15bmVzblRWQjZKZjc3c19ORUZtQmhXbGpLQWNGal9WZld4VjVmRVMtdyJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQjhtZHV0bTZET3RnV3BMQTJwdE1IdkN4Y0xfMGhaS3hrcGF2MVZfSVNGUkEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUF1VGNIMFAxX0djLXNFd0o3bHFnUUZBSHRpdWVHSEJyQ1N6YU1haGdZUXNRIn19';

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
