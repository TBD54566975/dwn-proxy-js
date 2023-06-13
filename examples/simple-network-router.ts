/**
 * simple network router to your backend, `/my/api`
 */

import { App } from '../src/main';

const app = new App();

// for all RecordsQuery, fetch the record from your backend
app.dwn.records.query(async message => {
  const res = await fetch(`/my/api?message=${encodeURIComponent(JSON.stringify(message))}`);
  const record = await res.body.json();
  return record;
});

// for all RecordsWrite, forward them via fetch to `/my/api`
app.dwn.records.write(async (message, data) => {
  const res = await fetch('/my/api', {
    method : 'POST',
    body   : JSON.stringify({ message, data })
  });
  return res.status === 200;
});

// for all outbounds, just forward it on to the target DWN
app.post('/send/dwm', async req => {
  const { targetDid, record } = await req.body.json();
  return {
    targetDid,
    record
  };
});