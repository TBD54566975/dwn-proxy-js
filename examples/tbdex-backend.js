import http from 'http'
import url from 'url'

import { createMessage } from './tbdex-protocol.js'

const readReqBody = async req =>
  new Promise(resolve => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      if (data)
        resolve(JSON.parse(data))
      else
        resolve(undefined)
    })
  })

const handleOffering = async (req, res) => {
  console.log('Handling offering!')

  const offering = {
    description            : 'test offering',
    pair                   : 'USD_BTC',
    unitPrice              : '100',
    min                    : '0',
    max                    : '1000',
    presentationRequestJwt : 'testjwt',
    payinInstruments       : [],
    payoutInstruments      : []
  }
  const message = createMessage({
    to   : 'todo remove b/c this is a "resource"',
    from : 'todo remove b/c this is a "resource"',
    type : 'offering',
    body : offering
  })

  res.statusCode = 202
  res.end(JSON.stringify(message))
}

const handleRfq = async (req, res) => {
  console.log('Handling RFQ!')
  // const body = await readReqBody(req)
  // console.log('RFQ DWN message', body.dwnMessage)
  // console.log('RFQ', body.tbdexMessage)
  // const contextId = body.dwnMessage.contextId
  // const threadId = body.tbdexMessage.threadId
  // const alice = body.tbdexMessage.from
  // console.log(threadId)

  // console.log('Waiting a few seconds, then going to fire off a Quote in response...')
  // setTimeout(() => {
  //   console.log('Firing off Quote...')
  //   let quoteRecordId = undefined
  //   fetch('http://localhost:8080/quote', {
  //     method : 'POST',
  //     body   : JSON.stringify({
  //       dwnMessage: {
  //         rfqRecordId: body.dwnMessage.rfqRecordId,
  //         contextId
  //       },
  //       tbdexMessage: createMessage({
  //         last : { threadId },
  //         to   : alice,
  //         type : 'quote',
  //         body : {
  //           expiryTime                    : new Date().toISOString(),
  //           totalFee                      : '100',
  //           amount                        : '1000',
  //           paymentPresentationRequestJwt : '',
  //           paymentInstructions           : { payin: { link: 'fake.link.com' } }
  //         }
  //       }) })
  //   }).then(res => res.json())
  //     .then((body => {
  //       quoteRecordId = body.dwnMessage.quoteRecordId
  //     })).then(() => {
  //       const createOrderStatus = orderStatus => ({
  //         dwnMessage: {
  //           quoteRecordId,
  //           contextId
  //         },
  //         tbdexMessage: createMessage({
  //           last : { threadId },
  //           to   : alice,
  //           type : 'orderStatus',
  //           body : {
  //             orderStatus
  //           }
  //         })
  //       })

  //       setTimeout(() => {
  //         console.log('firing off PENDING')
  //         fetch('http://localhost:8080/order-status', {
  //           method : 'POST',
  //           body   : JSON.stringify(createOrderStatus('PENDING'))
  //         }).then(() => {
  //           setTimeout(() => {
  //             console.log('firing off COMPLETED')
  //             fetch('http://localhost:8080/order-status', {
  //               method : 'POST',
  //               body   : JSON.stringify(createOrderStatus('COMPLETE'))
  //             })
  //           }, 4500)
  //         })
  //       }, 4500)

  //       console.log(quoteRecordId)
  //       console.log('todo fire off some order status')
  //     })
  // }, 4500)

  res.statusCode = 202
  res.end()
}

const handleOrder = async (req, res) => {
  console.log('order!')
  res.statusCode = 202
  res.end()
}

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname
  console.log('URL Path:', path)

  switch (path) {
    case '/tbdex/offers':
      handleOffering(req, res)
      break
    case '/tbdex/rfq':
      handleRfq(req, res)
      break
    case '/order':
      handleOrder(req, res)
      break
    default:
      res.statusCode = 404
      res.end()
  }
})

const PORT = 3001
const HOST = '0.0.0.0'
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`)
})
