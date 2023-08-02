import { Web5 } from '@tbd54566975/web5'
import { createMessage, aliceProtocolDefinition } from '@tbd54566975/tbdex'

const args = process.argv.slice(2)
const PFI_DID = args[0]
if (!PFI_DID) {
  console.error('Error: No command line argument provided; you need to provide the PFI\'s DID')
  process.exit(1)
}

const { web5, did } = await Web5.connect({
  techPreview: {
    // dwnEndpoints: ['https://tyler.tbddev.org/']
    dwnEndpoints: ['http://localhost:3000']
  }
})

let rfqRecordId = undefined
let quoteRecordId = undefined
// let quoteContextId = undefined
// let orderRecordId = undefined
// let orderStatus = undefined

const configureProtocol = async () => {
  await web5.dwn.protocols.configure({
    message: {
      definition: aliceProtocolDefinition
    }
  })
}

const getOffer = async () => {
  const result = await web5.dwn.records.query({
    from    : PFI_DID,
    message : {
      filter: {
        schema: 'https://tbd.website/resources/tbdex/Offering'
      },
      dateSort: 'createdAscending'
    }
  })

  return await result.records[result.records.length - 1]?.data.json()
}

const submitRfq = async () => {
  const tbdexMessage = createMessage({
    to   : PFI_DID,
    from : did,
    type : 'rfq',
    body : {
      pair                      : 'USD_BTC',
      amount                    : '1000',
      verifiablePresentationJwt : 'fake-jwt',
      payinInstrument           : {
        kind: 'DEBIT_CARD'
      },
      payoutInstrument: {
        kind: 'BTC_ADDRESS'
      }
    }
  })

  const { record } = await web5.dwn.records.create({
    data    : tbdexMessage,
    message : {
      protocol     : aliceProtocolDefinition.protocol,
      protocolPath : 'RFQ',
      schema       : aliceProtocolDefinition.types.RFQ.schema,
      dataFormat   : 'application/json',
      recipient    : PFI_DID
    },
  })

  rfqRecordId = record.id

  await record.send(PFI_DID)
}

const pollForQuote = async () => {
  await new Promise(resolve => {
    const interval = setInterval(async () => {
      const result = await web5.dwn.records.query({
        message: {
          filter: {
            parentId: rfqRecordId
          }
        }
      })

      if (result.status.code === 200 && result.records.length > 0) {
        quoteRecordId = result.records[0].id
        clearInterval(interval)
        resolve()
      }
    }, 1000)
  })
}

// const submitOrder = async () => {
//   const tbdexMessage = createMessage({
//     to   : PFI_DID,
//     from : did,
//     type : 'Order',
//     body : {
//       empty: ''
//     }
//   })

//   const { record } = await web5.dwn.records.create({
//     data    : tbdexMessage,
//     message : {
//       protocol     : aliceProtocolDefinition.protocol,
//       protocolPath : 'RFQ/Quote/Order',
//       schema       : aliceProtocolDefinition.types.Order.schema,
//       dataFormat   : 'application/json',
//       recipient    : PFI_DID,
//       parentId     : quoteRecordId,
//       contextId    : quoteContextId
//     },
//   })

//   orderRecordId = record.id

//   await record.send(PFI_DID)
// }

const pollForOrderStatusUpdates = async () => {
  let statuses = {}

  await new Promise(resolve => {
    const interval = setInterval(async () => {
      const result = await web5.dwn.records.query({
        message: {
          filter: {
            // parentId: orderRecordId
            parentId: quoteRecordId
          },
          dateSort: 'createdAscending'
        }
      })

      if (result.status.code === 200 && Object.keys(statuses).length < result.records.length) {
        for (const record of result.records) {
          const { body: { orderStatus } } = await record.data.json()
          if (!statuses[orderStatus]) {
            statuses[orderStatus] = true
            console.log('Update: ', orderStatus)
          }

          if (orderStatus === 'COMPLETED') {
            clearInterval(interval)
            resolve()
          }
        }
      }

      // console.log(result.records.length)
      // if (result.status.code === 200 && result.records.length > 0) {
      //   const data = await result.records[result.records.length-1].data.json()

      //   if (data.body.orderStatus !== orderStatus) {
      //     orderStatus = data.body.orderStatus
      //     console.log('Update:', orderStatus)
      //   }

      //   if (orderStatus === 'COMPLETED') {
      //     clearInterval(interval)
      //     resolve()
      //   }
      // }
    }, 1000)
  })
}

const main = async () => {
  try {
    console.log('\nConfiguring protocol...')
    await configureProtocol()
    console.log('Protocol configured\n')

    console.log('Querying for offers...')
    await getOffer()
    console.log('Offer found\n')

    console.log('Submitted RFQ...')
    await submitRfq()
    console.log('RFQ submitted\n')

    console.log('Polling for quote...')
    await pollForQuote()
    console.log('Quote found\n')

    // console.log('Submitting order...')
    // await submitOrder()
    // console.log('Order submitted\n')

    console.log('Polling for order status updates')
    await pollForOrderStatusUpdates()
    console.log('Exchange successful, goodbye\n')
  } catch(err) {
    console.error('Catch-all error', err)
  }

  process.exit(0)
}

main()
