import { App } from './App.js';

const app = new App();

app.use((req, _, next) => {
  console.log('New request recieved', req.path);
  next();
});

app.inbound.use((msg, next) => {
  console.log('New inbound message received', msg);
  next();
});

app.inbound.records.write({ protocol: 'tbdex', schema: 'rfq' }, (msg) => {
  console.log('New inbound message received for tbdex rfq', msg);
  return {
    path   : '/rfq',
    method : 'POST'
  };
});

app.inbound.routes.push({
  match: msg =>
    msg.descriptor.protocol === 'tbdex' && msg.descriptor.schema === 'accept',
  use: msg => {
    console.log('New inbound message received for tbdex rfq', msg);
    return {
      path   : '/accept',
      method : 'POST'
    };
  }
});

app.listen(3000, 30001);