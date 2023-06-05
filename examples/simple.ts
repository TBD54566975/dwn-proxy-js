import { App } from '../src/main';

const app = new App();

// simple inbound route
const match = { protocol: 'tbdex', schema: 'offer' };
const route = { path: '/some/api/offer', method: 'GET' };
app.inbound.records.query(match, route);

// inbound route with middleware
app.inbound.records.write(
  { protocol: 'tbdex', schema: 'rfq' },
  { path: '/some/api/rfq', method: 'POST' },
  msg => {
    return {
      hello : msg.data.hello,
      world : msg.data.world
    };
  });

// simple outbound route
app.outbound.post('/some/api/quote');

//outbound route with middleware
app.outbound.post('/some/api/status', (req, res) => {
  // do some middleware things
  return {
    descriptor: {
      protocol : 'tbdex',
      schema   : 'status'
    },
    data: {
      something: 'else'
    }
  };
});

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);