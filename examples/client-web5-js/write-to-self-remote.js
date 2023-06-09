import { Web5 } from '@tbd54566975/web5';

const { web5, did } = await Web5.connect();

const write = await web5.dwn.records.write({
  to   : did,
  data : 'Hello World! 123'
});
console.log(await write.record.data.text());

const query = await web5.dwn.records.query({
  from    : did,
  message : {
    filter: {
      recordId: write.record.id
    }
  }
});
console.log(await query.records[0].data.text());
