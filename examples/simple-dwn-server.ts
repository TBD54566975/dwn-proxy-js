/**
 * recreate dwn-server by just always having the handlers return the appropriate responses
 */
import { App } from '../src/main';

const app = new App();

// for all RecordsQuery, return undefined, which'll read from the local DWN storage
app.dwn.records.query(async () => undefined);

// for all RecordsWrite, return true, which'll call dwn.processMessage()
app.dwn.records.write(async () => true);