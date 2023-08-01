import { expect } from 'chai'
import sinon from 'sinon'
import type { SinonStub } from 'sinon'
import { Dwn } from '@tbd54566975/dwn-sdk-js'
import type { MessageStore, DataStore, EventLog, TenantGate } from '@tbd54566975/dwn-sdk-js'
import { DataStoreLevel, EventLogLevel, MessageStoreLevel } from '@tbd54566975/dwn-sdk-js/stores'
import { DwnProxy } from '../src/dwn-proxy.js'

describe('DwnProxy', () => {
  let dwnStub: SinonStub

  beforeEach(() => {
    dwnStub = sinon.stub(Dwn, 'create')
    dwnStub.resolves({})
  })

  afterEach(() => {
    dwnStub.restore()
  })

  it('Should support developer-defined DWN instance', async () => {
    await DwnProxy.create({
      dwn: {
        instance: await Dwn.create({
          messageStore : new MessageStoreLevel(),
          dataStore    : new DataStoreLevel(),
          eventLog     : new EventLogLevel()
        })
      }
    })

    expect(dwnStub.calledOnce).to.be.true
  })

  it('Should support developer-defined stores', async () => {
    const messageStore = { test: 123 } as unknown as MessageStore
    const dataStore = { test: 123 } as unknown as DataStore
    const eventLog = { test: 123 } as unknown as EventLog

    await DwnProxy.create({
      dwn: {
        store: {
          messageStore,
          dataStore,
          eventLog
        }
      }
    })

    sinon.assert.calledWith(dwnStub, {
      messageStore : messageStore,
      dataStore    : dataStore,
      eventLog     : eventLog,
      tenantGate   : undefined
    })
  })

  it('Should default to LevelDB stores', async () => {
    await DwnProxy.create({})

    sinon.assert.calledWith(dwnStub, {
      messageStore : sinon.match.instanceOf(MessageStoreLevel),
      dataStore    : sinon.match.instanceOf(DataStoreLevel),
      eventLog     : sinon.match.instanceOf(EventLogLevel),
      tenantGate   : undefined,
    })
  })

  it('Should support developer-defined tenant gate', async () => {
    const tenantGate = { test: 123 } as unknown as TenantGate

    await DwnProxy.create({
      dwn: {
        tenantGate
      }
    })

    sinon.assert.calledWith(dwnStub, {
      messageStore : sinon.match.object,
      dataStore    : sinon.match.object,
      eventLog     : sinon.match.object,
      tenantGate   : tenantGate,
    })
  })
})
