import { App } from './types';

const app = new App();

app.use((req, res, next) => {
  // write middleware for all requests, both inbound and outbound
  next();
});

app.inbound.use((msg, next) => {
  // write middleware for all inbound requests
  next();
});

app.inbound.routes.push({
  match: msg => {
    if (msg.some)
      return true;
    return false;
  },
  use: (msg, next) => {
    // write middleware for the given route
    next();
  },
});

app.outbound.get('/hello-world', (req, res) => {
  // write middleware for the given outbound request
  console.log(req, res);
  return {
    some: 'dwm'
  };
});

app.outbound.post('/hello-world', (req, res) => {
  // write middleware for the given outbound request
  console.log(req, res);
  return {
    some: 'dwm'
  };
});

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);

/**
 * - "I want a single port for both inbound and outbound"
 * - "I want automatic DWM formatting parsed for me"
 * - "I want a generic middleware which is called both inbound and outbound"
 * - "I want a generic middleware which is called for all inbounds"
 * - "I want a middleware which is called for a specific inbound route"
 * - "I want to use my own auth mechanism in the middleware"
 * - "I want my outbound request to assume the req is already as a DWM"
 */