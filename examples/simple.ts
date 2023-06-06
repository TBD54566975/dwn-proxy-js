import { App } from '../src/main';
// import fetch from 'some-http-tool';

const app = new App();

// simple inbound route
app.inbound.protocol.route('tbdex', 'offer', '/some/api/offer');

// // inbound route with middleware
// app.inbound.protocol.middleware(
//   'tbdex',
//   'rfq',
//   message => {
//     // do middleware things
//     fetch('/some/api/rfq', { something: message.data.thing });
//   }
// );

// // simple outbound route
// app.outbound.post('/some/api/quote');

// //outbound route with middleware
// app.outbound.post('/some/api/status', (req, res) => {
//   // do some middleware things
//   const did = req.somewhere.did;
//   Message.send('tbdex', 'status', did, { some: 'data' });
//   res.status = 200;
//   res.end();
// });

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);