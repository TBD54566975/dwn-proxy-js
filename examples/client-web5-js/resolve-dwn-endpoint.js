import { DidIonApi } from '@tbd54566975/dids';

const aliceDid = 'did:ion:EiBk840E9pN1Z0qcMwTvUkkoMVyX8YlCas9rU0tju_KcrQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoeiIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJCVDh2aC1SVUJodjZsRzVFd1VDQ0dYcG1xOVJwTmxudFFMTjlXYU9sTE84IiwieSI6IkYtZkRCT0NBbXF3SHBlV0Y1MnhvSV9sbkNOeEl1bWNXTUxkS1pQcHZOSk0ifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iXSwidHlwZSI6Ikpzb25XZWJLZXkyMDIwIn0seyJpZCI6ImVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJQNUg4eHJfX1Q3UW4tU0RIOV9OSVVyZjZfc0dEcjRtdnhrcy0waVVfQnRJIiwieSI6IlRmcHBuVjIwWXNBWnpOR2JubUFDdHRadXRneUZFUnRqVUQ1QnJkVTZJRkkifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im1lc3NhZ2VBdXRob3JpemF0aW9uS2V5cyI6WyIjYXV0aHoiXSwibm9kZXMiOlsiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd241IiwiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd242Il0sInJlY29yZEVuY3J5cHRpb25LZXlzIjpbIiNlbmMiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpRFNONFQ3TEd2bzdLX1E1Q3BVS0J6WGFqdmN2WjJLUW40OHNPY1NDRVJiVVEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUJrWGlEdlQ5TmhjaTFabjJkMnYxcGhneUo2R2NEczMtb1F5WGhJX2xXalZBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlBZ0FZdE5nRkI3VFRiTy1KLU5aMzYzMVpGNjVkZjk1X2VVbll6OUtIU1FSZyJ9fQ';

const api = new DidIonApi();
const result = await api.resolve(aliceDid);
console.log(result.didDocument.service.find(x => x.type === 'DecentralizedWebNode'));
