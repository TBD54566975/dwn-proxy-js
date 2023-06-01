import { App } from '../src/main';

/**
 * 1. DWN --> rfq --> PFI
 * 2. DWN <-- quote <-- PFI
 * 3. DWN --> accept --> PFI
 * 4. DWN <-- confirmed <-- PFI
 */

const app = new App();

/**
 * 1. DWN --> rfq --> PFI
 */
app.inbound.records.write({ protocol: 'tbdex', schema: 'rfq' }, (msg) => {
  console.log('New inbound message received for tbdex rfq', msg);
  // do middleware things
  return {
    path   : '/rfq',
    method : 'POST'
  };
});

/**
 * 2. DWN <-- quote <-- PFI
 */
app.outbound.post('/quote', (req, res) => {
  console.log('New outbound request received for /quote', req, res);
  // do middleware things
  return {
    descriptor: {
      protocol : 'tbdex',
      schema   : 'quote'
    }
  };
});

/**
 * 3. DWN --> accept --> PFI
 */
app.inbound.records.write({ protocol: 'tbdex', schema: 'accept' }, (msg) => {
  console.log('New inbound message received for tbdex accept', msg);
  // do middleware things
  return {
    path   : '/accept',
    method : 'POST'
  };
});

/**
 * 4. DWN <-- confirmed <-- PFI
 */
app.outbound.post('/confirmed', (req, res) => {
  console.log('New outbound request received for /confirmed', req, res);
  // do middleware things
  return {
    descriptor: {
      protocol : 'tbdex',
      schema   : 'confirmed'
    }
  };
});

//#region middlewares
app.use((req, _, next) => {
  console.log('New request recieved', req.path);
  next();
});
app.inbound.use((msg, next) => {
  console.log('New inbound message received', msg);
  next();
});
app.outbound.use((req, res, next) => {
  console.log('New outbound request received');
  next();
});
//#endregion

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);